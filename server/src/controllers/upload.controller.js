import { asyncHandler } from '../middlewares/asyncHandler.js';
import { uploadImageToCloudinary } from '../services/imageUpload.service.js';

export const uploadImage = asyncHandler(async (req, res) => {
  const image = await uploadImageToCloudinary({
    dataUrl: req.body.dataUrl,
    folder: req.body.folder,
  });

  res.status(201).json({
    status: 'success',
    data: {
      image,
    },
  });
});
