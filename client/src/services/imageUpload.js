const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export const validateImageFile = (file, labels) => {
  if (!file) return labels.noFile;

  if (!allowedImageTypes.includes(file.type)) {
    return labels.invalidType;
  }

  if (file.size > maxImageBytes) {
    return labels.tooLarge;
  }

  return '';
};

export const readImageAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
