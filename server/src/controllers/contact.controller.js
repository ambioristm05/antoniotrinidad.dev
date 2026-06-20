import { ContactMessage } from '../models/ContactMessage.js';
import { AppError } from '../utils/AppError.js';
import { buildQueryOptions } from '../utils/apiFeatures.js';
import { pick } from '../utils/pick.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const createContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(pick(req.body, ['name', 'email', 'subject', 'message']));

  res.status(201).json({
    status: 'success',
    message: 'Message received successfully',
    data: {
      contactMessage: message,
    },
  });
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = buildQueryOptions(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;

  const [messages, total] = await Promise.all([
    ContactMessage.find(filter).sort(sort).skip(skip).limit(limit),
    ContactMessage.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      messages,
    },
  });
});

export const updateContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    pick(req.body, ['status']),
    {
      new: true,
      runValidators: true,
    },
  );

  if (!message) {
    throw new AppError('Contact message not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      contactMessage: message,
    },
  });
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);

  if (!message) {
    throw new AppError('Contact message not found', 404);
  }

  res.status(204).send();
});
