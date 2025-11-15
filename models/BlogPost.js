import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  featuredImage: {
    type: String,
  },
  published: {
    type: Boolean,
    default: false,
  },
  excerpt: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  publishedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create text index for search
BlogSchema.index({ title: 'text', content: 'text' });

// Add pre-save hook to generate slug from title if not provided
BlogSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogSchema);
