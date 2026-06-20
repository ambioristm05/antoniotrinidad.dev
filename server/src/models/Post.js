import mongoose from 'mongoose';

import { calculateReadingTime } from '../utils/readingTime.js';
import { slugify } from '../utils/slugify.js';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [160, 'Post title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Post excerpt is required'],
      trim: true,
      maxlength: [260, 'Post excerpt cannot exceed 260 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    readingTime: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

postSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ featured: 1, publishedAt: -1 });
postSchema.index({ category: 1 });

postSchema.pre('validate', function preparePost(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  this.readingTime = calculateReadingTime(this.content);

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

export const Post = mongoose.model('Post', postSchema);
