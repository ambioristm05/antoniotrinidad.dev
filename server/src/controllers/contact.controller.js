import { ContactMessage } from '../models/ContactMessage.js';
import { saveContactMessage } from '../services/contact.service.js';
import { AppError } from '../utils/AppError.js';
import { buildQueryOptions, buildTextRegex } from '../utils/apiFeatures.js';
import { pick } from '../utils/pick.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { contactSortFields } from '../validators/contact.validators.js';

const sendPublicSuccess = (res) =>
  res.status(201).json({
    status: 'success',
    message: 'Message received successfully',
  });

export const createContactMessage = asyncHandler(async (req, res) => {
  if (req.body.website) {
    sendPublicSuccess(res);
    return;
  }

  await saveContactMessage(pick(req.body, ['name', 'email', 'subject', 'message']));
  sendPublicSuccess(res);
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = buildQueryOptions(req.query, {
    allowedSortFields: contactSortFields,
  });
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { name: buildTextRegex(req.query.search) },
      { email: buildTextRegex(req.query.search) },
      { subject: buildTextRegex(req.query.search) },
      { message: buildTextRegex(req.query.search) },
    ];
  }

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
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    throw new AppError('Contact message not found', 404);
  }

  Object.assign(message, pick(req.body, ['status']));
  await message.save();

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
