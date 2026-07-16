import { rules, validateBody } from '../middlewares/validate.js';

const allowedUploadFolders = ['projects', 'posts', 'general'];

export const validateImageUpload = validateBody({
  dataUrl: [
    rules.required('Image'),
    rules.string('Image'),
    rules.maxLength('Image', 7 * 1024 * 1024),
    (value) =>
      typeof value === 'string' &&
      !/^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(value)
        ? 'Image must be a base64 encoded PNG, JPG, WEBP or GIF data URL'
        : null,
  ],
  folder: [rules.string('Folder'), rules.enum('Folder', allowedUploadFolders)],
});
