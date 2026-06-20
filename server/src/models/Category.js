import mongoose from 'mongoose';

import { slugify } from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [80, 'Category name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['project', 'post'],
      required: [true, 'Category type is required'],
    },
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1, type: 1 }, { unique: true });

categorySchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }

  next();
});

export const Category = mongoose.model('Category', categorySchema);
