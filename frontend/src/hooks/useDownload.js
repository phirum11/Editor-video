import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { apiClient } from '../services/api';

export const useDownload = () => {
  const [downloads, setDownloads] = useState([]);
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [completedDownloads, setCompletedDownloads] = useState([]);
  const [failedDownloads, setFailedDownloads] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [overallSpeed, setOverallSpeed] = useState(0);

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Format speed
  const formatSpeed = (bytesPerSecond) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  // Start download
  const startDownload = useCallback(async (url, options = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    const download = {
      id,
      url,
      status: 'queued',
      progress: 0,
      downloadedSize: 0,
      totalSize: 0,
      speed: 0,
      eta: null,
      error: null,
      filename: options.filename || url.split('/').pop() || 'download',
      format: options.format || 'auto',
      quality: options.quality || 'best',
      audioFormat: options.audioFormat || 'mp3',
      extractAudio: options.extractAudio || false,
      createdAt: new Date().toISOString(),
      ...options
    };

    setDownloads((prev) => [...prev, download]);
    setActiveDownloads((prev) => [...prev, id]);

    // Start download in background
    downloadFile(id, url, options);

    return id;
  }, []);

  // Download file
  const downloadFile = async (id, url, options) => {
    try {
      // Update status
      updateDownload(id, { status: 'downloading' });

      // Create axios cancel token
      const source = axios.CancelToken.source();

      // Store cancel token
      updateDownload(id, { cancelToken: source });

      // Start download via API
      const response = await apiClient({
        url: '/download/start',
        method: 'POST',
        data: { url, ...options },
        onDownloadProgress: (progressEvent) => {
          const { loaded, total, speed } = progressEvent;
          const progress = (loaded / total) * 100;
          const eta = total ? (total - loaded) / speed : null;

          updateDownload(id, {
            progress,
            downloadedSize: loaded,
            totalSize: total,
            speed,
            eta,
            status: 'downloading'
          });

          // Update overall stats
          setDownloadedSize((prev) => prev + loaded);
          setTotalSize((prev) => prev + total);
          setOverallSpeed((prev) => prev + speed);
        },
        cancelToken: source.token
      });

      // Download complete
      updateDownload(id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        filePath: response.data.filePath
      });

      setActiveDownloads((prev) => prev.filter((d) => d !== id));
      setCompletedDownloads((prev) => [...prev, id]);
    } catch (error) {
      if (axios.isCancel(error)) {
        updateDownload(id, {
          status: 'cancelled',
          error: 'Download cancelled'
        });
      } else {
        updateDownload(id, {
          status: 'failed',
          error: error.message
        });
        setFailedDownloads((prev) => [...prev, id]);
      }
      setActiveDownloads((prev) => prev.filter((d) => d !== id));
    }
  };

  // Update download
  const updateDownload = useCallback((id, updates) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  // Cancel download
  const cancelDownload = useCallback(
    (id) => {
      const download = downloads.find((d) => d.id === id);
      if (download?.cancelToken) {
        download.cancelToken.cancel('Download cancelled by user');
      }
      updateDownload(id, { status: 'cancelling' });
    },
    [downloads, updateDownload]
  );

  // Pause download
  const pauseDownload = useCallback(
    (id) => {
      updateDownload(id, { status: 'paused' });
    },
    [updateDownload]
  );

  // Resume download
  const resumeDownload = useCallback(
    (id) => {
      const download = downloads.find((d) => d.id === id);
      if (download) {
        startDownload(download.url, {
          ...download,
          resume: true,
          downloadedSize: download.downloadedSize
        });
      }
    },
    [downloads, startDownload]
  );

  // Retry download
  const retryDownload = useCallback(
    (id) => {
      const download = downloads.find((d) => d.id === id);
      if (download) {
        startDownload(download.url, download);
      }
    },
    [downloads, startDownload]
  );

  // Remove download
  const removeDownload = useCallback((id) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
    setActiveDownloads((prev) => prev.filter((d) => d !== id));
    setCompletedDownloads((prev) => prev.filter((d) => d !== id));
    setFailedDownloads((prev) => prev.filter((d) => d !== id));
  }, []);

  // Clear completed
  const clearCompleted = useCallback(() => {
    setDownloads((prev) => prev.filter((d) => d.status !== 'completed'));
    setCompletedDownloads([]);
  }, []);

  // Get download info
  const getDownloadInfo = useCallback(async (url) => {
    try {
      const response = await apiClient.get('/download/info', {
        params: { url }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Get formats
  const getFormats = useCallback(async (url) => {
    try {
      const response = await apiClient.get('/download/formats', {
        params: { url }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Batch download
  const batchDownload = useCallback(
    async (items) => {
      const ids = [];
      for (const item of items) {
        const id = await startDownload(item.url, item.options);
        ids.push(id);
      }
      return ids;
    },
    [startDownload]
  );

  // Calculate overall stats
  useEffect(() => {
    const active = downloads.filter((d) => d.status === 'downloading');
    setActiveDownloads(active.map((d) => d.id));

    const completed = downloads.filter((d) => d.status === 'completed');
    setCompletedDownloads(completed.map((d) => d.id));

    const failed = downloads.filter((d) => d.status === 'failed');
    setFailedDownloads(failed.map((d) => d.id));

    const total = downloads.reduce((sum, d) => sum + (d.totalSize || 0), 0);
    const downloaded = downloads.reduce(
      (sum, d) => sum + (d.downloadedSize || 0),
      0
    );
    const speed = downloads.reduce((sum, d) => sum + (d.speed || 0), 0);

    setTotalSize(total);
    setDownloadedSize(downloaded);
    setOverallSpeed(speed);
  }, [downloads]);

  return {
    downloads,
    activeDownloads,
    completedDownloads,
    failedDownloads,
    totalSize,
    downloadedSize,
    overallSpeed,
    startDownload,
    cancelDownload,
    pauseDownload,
    resumeDownload,
    retryDownload,
    removeDownload,
    clearCompleted,
    getDownloadInfo,
    getFormats,
    batchDownload,
    formatBytes,
    formatSpeed,
    // Statistics
    stats: {
      total: downloads.length,
      active: activeDownloads.length,
      completed: completedDownloads.length,
      failed: failedDownloads.length,
      progress: totalSize ? (downloadedSize / totalSize) * 100 : 0,
      totalSize: formatBytes(totalSize),
      downloadedSize: formatBytes(downloadedSize),
      speed: formatSpeed(overallSpeed)
    }
  };
};

// Download queue
export const useDownloadQueue = () => {
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);

  const addToQueue = useCallback((item) => {
    setQueue((prev) => [...prev, { ...item, id: Date.now() }]);
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const processQueue = useCallback(async () => {
    if (processing || queue.length === 0) return;

    setProcessing(true);
    const item = queue[0];

    try {
      // Process item
      await item.process();
      removeFromQueue(item.id);
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      setProcessing(false);
    }
  }, [queue, processing, removeFromQueue]);

  useEffect(() => {
    processQueue();
  }, [queue, processQueue]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processing
  };
};
