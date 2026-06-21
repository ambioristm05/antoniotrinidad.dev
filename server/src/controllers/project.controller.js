import { Project } from '../models/Project.js';
import { AppError } from '../utils/AppError.js';
import { buildQueryOptions, buildTextRegex } from '../utils/apiFeatures.js';
import { pick } from '../utils/pick.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { projectSortFields } from '../validators/project.validators.js';

const projectFields = [
  'title',
  'slug',
  'summary',
  'description',
  'coverImage',
  'gallery',
  'technologies',
  'category',
  'status',
  'featured',
  'liveUrl',
  'repoUrl',
  'startDate',
  'endDate',
];

export const getProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = buildQueryOptions(req.query, {
    allowedSortFields: projectSortFields,
  });
  const filter = {};

  if (req.query.category) filter.category = req.query.category.trim().toLowerCase();
  if (req.query.status) filter.status = req.query.status;
  if (req.query.featured) filter.featured = req.query.featured === 'true';
  if (req.query.search) {
    filter.$or = [
      { title: buildTextRegex(req.query.search) },
      { summary: buildTextRegex(req.query.search) },
      { description: buildTextRegex(req.query.search) },
      { technologies: buildTextRegex(req.query.search) },
    ];
  }

  const [projects, total] = await Promise.all([
    Project.find(filter).sort(sort).skip(skip).limit(limit),
    Project.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      projects,
    },
  });
});

export const getFeaturedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ featured: true, status: 'completed' }).sort('-createdAt').limit(6);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects,
    },
  });
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: slugify(req.params.slug) });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      project,
    },
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(pick(req.body, projectFields));

  res.status(201).json({
    status: 'success',
    data: {
      project,
    },
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  Object.assign(project, pick(req.body, projectFields));
  await project.save();

  res.status(200).json({
    status: 'success',
    data: {
      project,
    },
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.status(204).send();
});
