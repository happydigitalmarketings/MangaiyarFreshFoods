import connectDB from '../../../lib/db';
import BlogPost from '../../../models/BlogPost';
import { getUserFromReq } from '../_utils';
import cloudinary from '../../../lib/cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) => {
  const form = new IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const { page = 1, limit = 10, tag } = req.query;
        const query = tag ? { tags: tag } : {};
        const posts = await BlogPost.find(query)
          .populate('author', 'name')
          .sort({ publishedAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit));
        res.json(posts);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching blog posts' });
      }
      break;

    case 'POST':
      try {
        const user = await getUserFromReq(req);
        if (!user || user.role !== 'admin') {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const { fields, files } = await parseForm(req);
        const titleValue = fields.title?.[0] || '';
        const contentValue = fields.content?.[0] || '';

        // Basic validation
        if (!titleValue || !titleValue.trim()) {
          return res.status(400).json({ message: 'Title is required' });
        }
        if (!contentValue || !contentValue.trim()) {
          return res.status(400).json({ message: 'Content is required' });
        }
        let imageUrl = '';

        // Handle image upload if provided
        if (files.image) {
          // formidable may return a single file object or an array
          let file = files.image;
          if (Array.isArray(file)) file = file[0];
          if (file && file.filepath) {
            // Use cloudinary.uploader.upload with the local filepath (simpler and reliable)
            const uploadResult = await cloudinary.uploader.upload(file.filepath, {
              resource_type: 'auto',
              folder: 'minukki/blog',
            });
            imageUrl = uploadResult.secure_url;
          }
        }

        const slugify = (s = '') => s.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const postData = {
          title: titleValue,
          slug: slugify(titleValue),
          content: contentValue,
          excerpt: fields.excerpt?.[0] || '',
          tags: fields.tags?.[0]?.split(',').map(t => t.trim()) || [],
          featuredImage: imageUrl,
          author: user._id,
        };

        const post = await BlogPost.create(postData);
        res.status(201).json(post);
      } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ message: 'Error creating blog post', error: error.message });
      }
      break;

    default:
      res.status(405).end();
  }
}