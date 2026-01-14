import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  Close,
} from '@mui/icons-material';
import { cmsService } from '../services/cms';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  folder?: string;
  label?: string;
  maxSize?: number; // in MB
  aspectRatio?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  folder = 'general',
  label = 'Upload Image',
  maxSize = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const { data, error } = await cmsService.uploadMedia(file, folder);
      if (error) throw error;
      
      if (data) {
        onImageChange(data.file_url);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Error details:', {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      
      // More specific error messages
      if (err.message?.includes('bucket') || err.statusCode === 404) {
        setError('Storage bucket not found. Please ensure the media bucket is created in Supabase.');
      } else if (err.message?.includes('policy') || err.statusCode === 403) {
        setError('Permission denied. Please check storage policies.');
      } else if (err.message?.includes('authenticated')) {
        setError('You must be logged in to upload images.');
      } else {
        setError(err.message || 'Failed to upload image');
      }
      
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    setError(null);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {preview ? (
        <Paper
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
            overflow: 'hidden',
            bgcolor: 'rgba(0,0,0,0.02)',
          }}
        >
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          )}
          <IconButton
            onClick={handleRemove}
            disabled={uploading}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Paper>
      ) : (
        <Paper
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: dragActive ? '#00d4ff' : 'divider',
            bgcolor: dragActive ? 'rgba(0,212,255,0.05)' : 'transparent',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#00d4ff',
              bgcolor: 'rgba(0,212,255,0.02)',
            },
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
            id={`image-upload-${folder}`}
            disabled={uploading}
          />
          <label htmlFor={`image-upload-${folder}`} style={{ cursor: 'pointer' }}>
            <Box sx={{ py: 2 }}>
              {uploading ? (
                <CircularProgress size={48} />
              ) : (
                <>
                  <CloudUpload sx={{ fontSize: 48, color: '#00d4ff', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drop image here or click to upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports: JPG, PNG, GIF, WebP (Max {maxSize}MB)
                  </Typography>
                </>
              )}
            </Box>
          </label>
        </Paper>
      )}
    </Box>
  );
};

export default ImageUpload;