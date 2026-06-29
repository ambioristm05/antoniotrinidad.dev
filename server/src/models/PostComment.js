import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: [true, 'Reply author name is required'],
      trim: true,
      maxlength: [100, 'Reply author name cannot exceed 100 characters'],
    },
    authorEmail: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Reply author email cannot exceed 254 characters'],
      validate: {
        validator: (value) => !value || /^\S+@\S+\.\S+$/.test(value),
        message: 'Reply author email is invalid',
      },
      select: false,
    },
    authorAvatar: {
      type: String,
      trim: true,
      maxlength: [1000, 'Reply author avatar cannot exceed 1000 characters'],
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Reply message is required'],
      trim: true,
      maxlength: [1500, 'Reply message cannot exceed 1500 characters'],
    },
  },
  { timestamps: true },
);

const postCommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
      index: true,
    },
    authorName: {
      type: String,
      required: [true, 'Comment author name is required'],
      trim: true,
      maxlength: [100, 'Comment author name cannot exceed 100 characters'],
    },
    authorEmail: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Comment author email cannot exceed 254 characters'],
      validate: {
        validator: (value) => !value || /^\S+@\S+\.\S+$/.test(value),
        message: 'Comment author email is invalid',
      },
      select: false,
    },
    authorAvatar: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment author avatar cannot exceed 1000 characters'],
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      trim: true,
      maxlength: [3000, 'Comment message cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'visible',
    },
    replies: [replySchema],
  },
  { timestamps: true },
);

postCommentSchema.index({ post: 1, status: 1, createdAt: -1 });

export const PostComment = mongoose.model('PostComment', postCommentSchema);
