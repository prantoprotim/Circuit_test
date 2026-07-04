import React, { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { uploadImage } from '../services/api';

export default function UploadSection({
  experimentTitle,
  onTitleChanged,
  onImageUploaded,
  onImageRemoved,
  imageFilename
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, GIF, WEBP).');
      return;
    }

    setError('');
    setUploading(true);
    
    // Create local object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Call API
    const result = await uploadImage(file);
    setUploading(false);

    if (result.success) {
      onImageUploaded(result.filename);
    } else {
      setError(result.error || 'Failed to upload image. Please try again.');
      setPreviewUrl('');
      onImageRemoved();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-panel" id="upload-panel">
      <div className="text-input-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="experiment-title-input">Experiment Title</label>
        <input
          id="experiment-title-input"
          type="text"
          placeholder="e.g. 555 Timer Astable Multivibrator"
          className="text-input"
          value={experimentTitle}
          onChange={(e) => onTitleChanged(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
        OR
      </div>

      <div className="text-input-group">
        <label>Upload Circuit Image</label>
        
        {!previewUrl && !imageFilename ? (
          <div 
            className={`dropzone ${dragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            id="image-dropzone"
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept="image/*"
              id="file-input"
            />
            <Upload className="dropzone-icon" />
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>
              {uploading ? 'Uploading your circuit...' : 'Drag & drop circuit image here'}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {!uploading && 'or click to browse from files'}
            </p>
          </div>
        ) : (
          <div className="image-preview-container">
            {previewUrl ? (
              <img src={previewUrl} alt="Circuit Preview" className="image-preview" />
            ) : (
              <div style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <FileText size={32} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Image: {imageFilename}</span>
              </div>
            )}
            <button 
              className="remove-image-btn" 
              onClick={handleRemoveImage}
              title="Remove Image"
              type="button"
              id="remove-image-button"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '0.75rem', color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }} id="upload-error">
          {error}
        </div>
      )}
    </div>
  );
}
