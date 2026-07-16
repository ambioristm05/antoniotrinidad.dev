import { Post } from '../models/Post.js';
import { cleanupUnusedCloudinaryImages } from '../services/imageUpload.service.js';
import { AppError } from '../utils/AppError.js';
import { buildQueryOptions, buildTextRegex } from '../utils/apiFeatures.js';
import { pick } from '../utils/pick.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { postSortFields } from '../validators/post.validators.js';

const postFields = [
  'title',
  'slug',
  'excerpt',
  'content',
  'coverImage',
  'category',
  'tags',
  'status',
  'featured',
  'publishedAt',
];

const getPublicPostFilter = () => ({
  status: 'published',
  publishedAt: { $lte: new Date() },
});

const getPostImageUrls = (post) => [post.coverImage].filter(Boolean);

export const getPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = buildQueryOptions(req.query, {
    allowedSortFields: postSortFields,
  });
  const filter = getPublicPostFilter();

  if (req.query.category) filter.category = req.query.category.trim().toLowerCase();
  if (req.query.tag) filter.tags = req.query.tag.trim().toLowerCase();
  if (req.query.featured) filter.featured = req.query.featured === 'true';
  if (req.query.search) {
    filter.$or = [
      { title: buildTextRegex(req.query.search) },
      { excerpt: buildTextRegex(req.query.search) },
      { content: buildTextRegex(req.query.search) },
      { tags: buildTextRegex(req.query.search) },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter).populate('author', 'name avatar').sort(sort).skip(skip).limit(limit),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      posts,
    },
  });
});

export const getAdminPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = buildQueryOptions(req.query, {
    allowedSortFields: postSortFields,
  });
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category.trim().toLowerCase();
  if (req.query.tag) filter.tags = req.query.tag.trim().toLowerCase();
  if (req.query.featured) filter.featured = req.query.featured === 'true';
  if (req.query.search) {
    filter.$or = [
      { title: buildTextRegex(req.query.search) },
      { excerpt: buildTextRegex(req.query.search) },
      { content: buildTextRegex(req.query.search) },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter).populate('author', 'name avatar').sort(sort).skip(skip).limit(limit),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      posts,
    },
  });
});

export const getFeaturedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ ...getPublicPostFilter(), featured: true })
    .populate('author', 'name avatar')
    .sort('-publishedAt')
    .limit(6);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts,
    },
  });
});

export const getPostBySlug = asyncHandler(async (req, res) => {
  const filter = {
    slug: slugify(req.params.slug),
    ...getPublicPostFilter(),
  };
  const post = await Post.findOne(filter).populate('author', 'name avatar');

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({
    ...pick(req.body, postFields),
    author: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      post,
    },
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const previousImages = getPostImageUrls(post);

  Object.assign(post, pick(req.body, postFields));
  await post.save();
  await cleanupUnusedCloudinaryImages(previousImages, getPostImageUrls(post));

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  await cleanupUnusedCloudinaryImages(getPostImageUrls(post));

  res.status(204).send();
});
