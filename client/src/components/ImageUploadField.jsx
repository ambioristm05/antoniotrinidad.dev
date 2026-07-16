import { ImageUp } from 'lucide-react';
import { useRef, useState } from 'react';

import { api } from '../services/api.js';
import { readImageAsDataUrl, validateImageFile } from '../services/imageUpload.js';

export default function ImageUploadField({
  folder = 'general',
  hint,
  label,
  labels,
  multiline = false,
  name,
  onChange,
  placeholder,
  rows = 4,
  value,
}) {
  const [fileError, setFileError] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const updateValue = (nextValue) => {
    onChange({
      target: {
        name,
        type: 'text',
        value: nextValue,
      },
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    const validationError = validateImageFile(file, labels);

    setFileError(validationError);
    setPreview('');

    if (validationError) return;

    setUploading(true);

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setPreview(dataUrl);

      const response = await api.uploadImage({ dataUrl, folder }, { timeoutMs: 30000 });
      const imageUrl = response.data.image.url;

      updateValue(multiline && value.trim() ? `${value.trim()}\n${imageUrl}` : imageUrl);
      setFileError('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      setFileError(error.message || labels.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const inputProps = {
    name,
    onChange,
    placeholder,
    value,
  };

  return (
    <label>
      {label}
      {multiline ? (
        <textarea {...inputProps} rows={rows} />
      ) : (
        <input {...inputProps} />
      )}
      <span className="image-upload-control">
        <input
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={uploading}
          onChange={handleFileChange}
          ref={inputRef}
          type="file"
        />
        <span className="image-upload-control__status">
          <ImageUp aria-hidden="true" size={17} />
          {uploading ? labels.uploading : labels.upload}
        </span>
      </span>
      {preview ? <img alt="" className="image-upload-preview" src={preview} /> : null}
      {fileError ? <small className="field-error">{fileError}</small> : null}
      {hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  );
}
