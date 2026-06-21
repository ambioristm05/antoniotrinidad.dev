import { Category } from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import { pick } from '../utils/pick.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.type) filter.type = req.query.type.trim().toLowerCase();

  const categories = await Category.find(filter).sort('name');

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(pick(req.body, ['name', 'slug', 'type']));

  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  Object.assign(category, pick(req.body, ['name', 'slug', 'type']));
  await category.save();

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(204).send();
});
