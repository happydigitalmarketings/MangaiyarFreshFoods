import connectDB from '../../../lib/db';
import BlogPost from '../../../models/BlogPost';
import { getUserFromReq } from '../_utils';
import cloudinary from '../../../lib/cloudinary';
import { IncomingForm } from 'formidable';

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

// Helper to read JSON body when bodyParser is disabled
const readJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err) => reject(err));
  });
};

export default async function handler(req, res) {
  await connectDB();
  const { slug } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        // Allow fetching by slug or by ObjectId
        const identifier = slug;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
        const post = isObjectId
          ? await BlogPost.findById(identifier).populate('author', 'name')
          : await BlogPost.findOne({ slug: identifier }).populate('author', 'name');
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching blog post' });
      }
      break;

    case 'PUT':
      try {
        const user = await getUserFromReq(req);
        if (!user || user.role !== 'admin') {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const post = await BlogPost.findOne({ slug });
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }

        // If request is multipart, parse form and handle file upload
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
          const { fields, files } = await parseForm(req);
          // map fields (formidable returns arrays for fields)
          const title = fields.title?.[0] || post.title;
          const content = fields.content?.[0] || post.content;
          const excerpt = fields.excerpt?.[0] || post.excerpt;
          const tags = fields.tags?.[0] ? fields.tags[0].split(',').map(t => t.trim()) : post.tags;

          post.title = title;
          post.content = content;
          post.excerpt = excerpt;
          post.tags = tags;

          if (files.image) {
            let file = files.image;
            if (Array.isArray(file)) file = file[0];
            if (file && file.filepath) {
              const uploadResult = await cloudinary.uploader.upload(file.filepath, {
                resource_type: 'auto',
                folder: 'minukki/blog',
              });
              post.featuredImage = uploadResult.secure_url;
            }
          }

          await post.save();
          return res.json(post);
        }

        // Fallback: assume JSON body
        Object.assign(post, req.body);
        await post.save();
        res.json(post);
      } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ message: 'Error updating blog post' });
      }
      break;

    case 'PATCH':
      try {
        const user = await getUserFromReq(req);
        if (!user || user.role !== 'admin') {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        // Allow updating by slug or by ObjectId passed in the URL
        const identifier = slug;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
        const post = isObjectId
          ? await BlogPost.findById(identifier)
          : await BlogPost.findOne({ slug: identifier });

        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }

        // Read body (JSON) because bodyParser is disabled for file uploads
        const contentType = req.headers['content-type'] || '';
        let bodyData = {};
        if (contentType.includes('application/json')) {
          try {
            bodyData = await readJsonBody(req);
          } catch (err) {
            console.error('Failed to parse JSON body in PATCH:', err);
            return res.status(400).json({ message: 'Invalid JSON' });
          }
        } else {
          // If not JSON, attempt to parse as empty object
          bodyData = {};
        }

        // Only allow certain fields to be patched (e.g., published)
        const allowed = ['published'];
        Object.keys(bodyData || {}).forEach((key) => {
          if (allowed.includes(key)) post[key] = bodyData[key];
        });

        // Set publishedAt when publishing, clear when unpublishing
        if (typeof bodyData.published !== 'undefined') {
          if (bodyData.published) post.publishedAt = new Date();
          else post.publishedAt = null;
        }

        await post.save();
        res.json(post);
      } catch (error) {
        console.error('Error patching post:', error);
        res.status(500).json({ message: 'Error updating blog post' });
      }
      break;

    case 'DELETE':
      try {
        const user = await getUserFromReq(req);
        if (!user || user.role !== 'admin') {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        // Allow deleting by slug or by ObjectId
        const identifier = slug;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
        let post;
        if (isObjectId) {
          post = await BlogPost.findByIdAndDelete(identifier);
        } else {
          post = await BlogPost.findOneAndDelete({ slug: identifier });
        }
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting blog post' });
      }
      break;

    default:
      res.status(405).end();
  }
}