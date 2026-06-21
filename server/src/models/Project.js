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
      required: [true, 'Project slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [160, 'Project slug cannot exceed 160 characters'],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Project slug is invalid'],
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
      maxlength: [10000, 'Project description cannot exceed 10000 characters'],
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
      lowercase: true,
      maxlength: [80, 'Project category cannot exceed 80 characters'],
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
    endDate: {
      type: Date,
      validate: {
        validator(value) {
          return !value || !this.startDate || value >= this.startDate;
        },
        message: 'Project end date cannot be before start date',
      },
    },
  },
  { timestamps: true },
);

projectSchema.index({ title: 'text', summary: 'text', description: 'text' });
projectSchema.index({ featured: 1, createdAt: -1 });
projectSchema.index({ category: 1 });

projectSchema.pre('validate', function setSlug(next) {
  if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  } else if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  if (this.isModified('technologies')) {
    this.technologies = [...new Set(this.technologies.map((item) => item.trim()).filter(Boolean))];
  }

  if (this.isModified('gallery')) {
    this.gallery = [...new Set(this.gallery.map((item) => item.trim()).filter(Boolean))];
  }

  next();
});

export const Project = mongoose.model('Project', projectSchema);
