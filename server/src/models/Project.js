import mongoose from 'mongoose';

import { slugify } from '../utils/slugify.js';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [140, 'Project title cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Project summary is required'],
      trim: true,
      maxlength: [240, 'Project summary cannot exceed 240 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    gallery: [
      {
        type: String,
        trim: true,
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      default: 'fullstack',
    },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed', 'archived'],
      default: 'completed',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
    },
    repoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true },
);

projectSchema.index({ title: 'text', summary: 'text', description: 'text' });
projectSchema.index({ featured: 1, createdAt: -1 });
projectSchema.index({ category: 1 });

projectSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  next();
});

export const Project = mongoose.model('Project', projectSchema);
