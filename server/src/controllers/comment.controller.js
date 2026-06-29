import { PostComment } from '../models/PostComment.js';
import { Post } from '../models/Post.js';
import { AppError } from '../utils/AppError.js';
import { buildQueryOptions } from '../utils/apiFeatures.js';
import { pick } from '../utils/pick.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { commentSortFields } from '../validators/comment.validators.js';
import { slugify } from '../utils/slugify.js';

const getPublicPostBySlug = async (slug) => {
  const post = await Post.findOne({
    slug: slugify(slug),
    status: 'published',
    publishedAt: { $lte: new Date() },
  }).select('_id slug');

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return post;
};

const sendPublicSuccess = (res) =>
  res.status(201).json({
    status: 'success',
    message: 'Comment received successfully',
  });

const toPublicReply = (reply) => ({
  _id: reply._id,
  authorName: reply.authorName,
  authorAvatar: reply.authorAvatar,
  message: reply.message,
  createdAt: reply.createdAt,
  updatedAt: reply.updatedAt,
});

const toPublicComment = (comment) => ({
  _id: comment._id,
  post: comment.post,
  authorName: comment.authorName,
  authorAvatar: comment.authorAvatar,
  message: comment.message,
  status: comment.status,
  replies: (comment.replies ?? []).map(toPublicReply),
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

export const getPostComments = asyncHandler(async (req, res) => {
  const post = await getPublicPostBySlug(req.params.slug);
  const { page, limit, skip, sort } = buildQueryOptions(req.query, {
    allowedSortFields: commentSortFields,
    defaultSort: '-createdAt',
    maxLimit: 50,
  });

  const filter = { post: post._id, status: 'visible' };
  const [comments, total] = await Promise.all([
    PostComment.find(filter).sort(sort).skip(skip).limit(limit),
    PostComment.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: comments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      comments: comments.map(toPublicComment),
    },
  });
});

export const createPostComment = asyncHandler(async (req, res) => {
  if (req.body.website) {
    sendPublicSuccess(res);
    return;
  }

  const post = await getPublicPostBySlug(req.params.slug);

  const comment = await PostComment.create({
    post: post._id,
    ...pick(req.body, ['authorName', 'authorEmail', 'authorAvatar', 'message']),
  });

  res.status(201).json({
    status: 'success',
    message: 'Comment received successfully',
    data: {
      comment: toPublicComment(comment),
    },
  });
});

export const createPostCommentReply = asyncHandler(async (req, res) => {
  if (req.body.website) {
    sendPublicSuccess(res);
    return;
  }

  const post = await getPublicPostBySlug(req.params.slug);
  const comment = await PostComment.findOne({
    _id: req.params.commentId,
    post: post._id,
    status: 'visible',
  });

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  comment.replies.push(pick(req.body, ['authorName', 'authorEmail', 'authorAvatar', 'message']));
  await comment.save();

  const reply = comment.replies.at(-1);

  res.status(201).json({
    status: 'success',
    message: 'Reply received successfully',
    data: {
      reply: toPublicReply(reply),
    },
  });
});
