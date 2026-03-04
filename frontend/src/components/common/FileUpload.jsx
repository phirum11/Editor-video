import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  Loader,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  Eye,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  accept = '*',
  maxSize = 500 * 1024 * 1024,
  maxFiles = 1,
  multiple = false,
  showPreview = true,
  autoUpload = true,
  validateFile,
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [previewFile, setPreviewFile] = useState(null);

  // Get file type for accept prop (must be defined before useDropzone)
  const getFileType = (extension) => {
    const types = {
      '.jpg': 'image/*',
      '.jpeg': 'image/*',
      '.png': 'image/*',
      '.gif': 'image/*',
      '.webp': 'image/*',
      '.mp4': 'video/*',
      '.avi': 'video/*',
      '.mov': 'video/*',
      '.mkv': 'video/*',
      '.webm': 'video/*',
      '.mp3': 'audio/*',
      '.wav': 'audio/*',
      '.ogg': 'audio/*',
      '.flac': 'audio/*',
      '.aac': 'audio/*',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.srt': 'text/plain',
      '.vtt': 'text/vtt',
      '.txt': 'text/plain'
    };
    return types[extension.toLowerCase()] || null;
  };

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const newErrors = {};
        rejectedFiles.forEach(({ file, errors }) => {
          newErrors[file.name] = errors.map((e) => e.message).join(', ');
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
      }

      // Process accepted files
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : null,
        progress: 0,
        status: 'pending'
      }));

      setFiles((prev) => {
        const updated = multiple ? [...prev, ...newFiles] : newFiles;
        // Clean up old preview URLs
        prev.forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
        return updated;
      });

      // Auto upload if enabled
      if (autoUpload) {
        handleUpload(newFiles);
      }

      // Call parent callback
      if (!multiple && newFiles.length > 0) {
        onFileSelect?.(newFiles[0].file);
      } else if (multiple) {
        onFileSelect?.(newFiles.map((f) => f.file));
      }
    },
    [multiple, autoUpload, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, ext) => {
      const type = getFileType(ext.trim());
      if (type) acc[type] = [ext.trim()];
      return acc;
    }, {}),
    maxSize,
    maxFiles,
    multiple
  });

  // Handle file upload (simulated)
  const handleUpload = async (filesToUpload) => {
    setUploading(true);

    for (const fileObj of filesToUpload) {
      setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 0 }));

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress((prev) => ({ ...prev, [fileObj.id]: i }));
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, status: 'uploaded' } : f
        )
      );
    }

    setUploading(false);
  };

  // Handle file removal
  const handleRemove = (id) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      const filtered = prev.filter((f) => f.id !== id);

      // Call parent callback
      if (!multiple && filtered.length === 0) {
        onFileRemove?.();
      }

      return filtered;
    });

    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  // Handle retry failed file
  const handleRetry = (id) => {
    const fileObj = files.find((f) => f.id === id);
    if (fileObj) {
      handleUpload([fileObj]);
    }
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type.includes('pdf') || file.type.includes('document'))
      return FileText;
    if (file.type.includes('zip') || file.type.includes('rar')) return Archive;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 transition cursor-pointer
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
          } ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="text-center">
          <Upload
            className={`w-12 h-12 mx-auto mb-4 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`}
          />

          {isDragActive ? (
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              Drop your files here
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drag & drop files or{' '}
                <span className="text-blue-600 dark:text-blue-400">browse</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: {accept} (Max: {formatFileSize(maxSize)})
              </p>
              {maxFiles > 1 && (
                <p className="text-xs text-gray-400 mt-2">
                  Up to {maxFiles} files
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((fileObj) => {
            const FileIcon = getFileIcon(fileObj.file);
            const progress = uploadProgress[fileObj.id] || 0;
            const error = errors[fileObj.file.name];

            return (
              <div
                key={fileObj.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-start space-x-4">
                  {/* File preview */}
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.file.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fileObj.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatFileSize(fileObj.file.size)}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2">
                        {fileObj.preview && showPreview && (
                          <button
                            onClick={() => setPreviewFile(fileObj)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                          >
                            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(fileObj.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Upload progress */}
                    {uploading && progress < 100 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            Uploading...
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className="mt-2 flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">{error}</span>
                      </div>
                    )}

                    {/* Status */}
                    {fileObj.status === 'uploaded' && (
                      <div className="mt-2 flex items-center space-x-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-xs">Uploaded successfully</span>
                      </div>
                    )}

                    {/* Retry button for failed uploads */}
                    {error && (
                      <button
                        onClick={() => handleRetry(fileObj.id)}
                        className="mt-2 flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {previewFile.file.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
              {previewFile.file.type.startsWith('image/') ? (
                <img
                  src={previewFile.preview}
                  alt={previewFile.file.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
