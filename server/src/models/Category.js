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
      required: [true, 'Category slug is required'],
      lowercase: true,
      trim: true,
      maxlength: [100, 'Category slug cannot exceed 100 characters'],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Category slug is invalid'],
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
  if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  } else if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }

  next();
});

export const Category = mongoose.model('Category', categorySchema);
