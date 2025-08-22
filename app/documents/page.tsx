'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';


interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  extractedText?: string;
  url: string;
}

interface ProcessedUrl {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  extractedText?: string;
  title?: string;
}

interface DocumentApiResponse {
  id: string;
  title: string;
  file_size?: number;
  file_type?: string;
  content?: string;
  url?: string;
}

const DocumentUploadPage = () => {
  const [user] = useAuthState(auth);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedUrls, setProcessedUrls] = useState<ProcessedUrl[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!user) return;
      
      setIsLoadingDocs(true);
      try {
        const response = await fetch(`${apiUrl}/user-documents?user_id=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          
          // Transform the data to match your component's state structure
          const files: UploadedFile[] = data.files?.map((doc: DocumentApiResponse) => ({
            id: doc.id,
            file: {
              name: doc.title,
              size: doc.file_size || 0,
              type: doc.file_type || 'application/octet-stream'
            } as File,
            status: 'completed' as const,
            extractedText: doc.content,
            url: doc.url || 'document'
          })) || [];
  
          const urls: ProcessedUrl[] = data.urls?.map((doc: DocumentApiResponse) => ({
            id: doc.id,
            url: doc.url,
            status: 'completed' as const,
            extractedText: doc.content,
            title: doc.title
          })) || [];
  
          setUploadedFiles(files);
          setProcessedUrls(urls);
        }
      } catch (error) {
        console.error('Failed to fetch user documents:', error);
        showNotification('error', 'Failed to load your documents');
      } finally {
        setIsLoadingDocs(false);
      }
    };
  
    fetchUserDocuments();
  }, [user, apiUrl]);


  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 50MB';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload PDF, Word, or Text files.';
    }
    return null;
  };

  const validateUrl = (url: string): string | null => {
    try {
      new URL(url);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setShowAlert({ type, message });
    setTimeout(() => setShowAlert(null), 4000);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
      } else {
        // For PDF and Word files, you'll need to implement server-side extraction
        // For now, we'll just use the filename as placeholder
        resolve(`Content extracted from ${file.name}`);
      }
    });
  };
  

  const processUrl = async (url: string): Promise<{ title: string; content: string }> => {
    if (!user) {
      throw new Error('Please sign in to process URLs');
    }
    const str = "documents"
    const res = await fetch(
      `${apiUrl}/scrape?base_url=${url}&user_id=${user.uid}&source_type=${str}`
    );
    if (!res.ok) throw new Error("Scrape failed");

    const data = await res.json();
    return {
      title: data.title || url,
      content: data.content || `Content extracted from ${url}`
    };
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      showNotification('error', 'Please enter a URL');
      return;
    }
  
    const validationError = validateUrl(urlInput.trim());
    if (validationError) {
      showNotification('error', validationError);
      return;
    }
  
    if (!user) {
      showNotification('error', 'Please sign in to process URLs');
      return;
    }
  
    const newUrl: ProcessedUrl = {
      id: Math.random().toString(36).substr(2, 9),
      url: urlInput.trim(),
      status: 'pending'
    };
  
    setProcessedUrls(prev => [...prev, newUrl]);
    setUrlInput('');
  
    setProcessedUrls(prev => 
      prev.map(u => u.id === newUrl.id ? {...u, status: 'processing'} : u)
    );
  
    try {
      const { title, content } = await processUrl(newUrl.url);
      
      setProcessedUrls(prev => 
        prev.map(u => u.id === newUrl.id ? {
          ...u, 
          status: 'completed',
          extractedText: content,
          title: title
        } : u)
      );
  
      showNotification('success', 'URL processed successfully!');
  
    } catch (error) {
      setProcessedUrls(prev => 
        prev.map(u => u.id === newUrl.id ? {
          ...u, 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Processing failed'
        } : u)
      );
      
      showNotification('error', 'Failed to process URL');
    }
  };

  const processAndUpsertFiles = async (files: UploadedFile[]) => {
  if (!user) {
    showNotification('error', 'Please sign in to upload documents');
    return;
  }

  try {
    const docsToUpsert = [];
    
    for (const uploadedFile of files) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? {...f, status: 'processing'} : f)
      );

      try {
        const extractedText = await extractTextFromFile(uploadedFile.file);
        
        const docData = {
          id: uploadedFile.id,
          content: extractedText,
          title: uploadedFile.file.name,
          file_type: uploadedFile.file.type,
          file_size: uploadedFile.file.size,
          uploaded_at: new Date().toISOString(),
          source_type: 'file'
        };

        docsToUpsert.push(docData);
        
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? {
            ...f, 
            extractedText: extractedText
          } : f)
        );

      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? {
            ...f, 
            status: 'failed',
            error: `Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`
          } : f)
        );
      }
    }

    if (docsToUpsert.length === 0) {
      showNotification('error', 'No documents could be processed');
      return;
    }

    const test = "documents"
    const response = await fetch(`${apiUrl}/upsert-docs?user_id=${user.uid}&source_type=${test}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        docs: docsToUpsert
      }),
    });

    if (!response.ok) {
      throw new Error(`Upsert failed: ${response.statusText}`);
    }

    setUploadedFiles(prev => 
      prev.map(f => 
        files.some(file => file.id === f.id) 
          ? {...f, status: 'completed'}
          : f
      )
    );

    showNotification('success', `Successfully processed ${docsToUpsert.length} document(s)!`);

  } catch (error) {
    console.error('Upsert error:', error);
    
    setUploadedFiles(prev => 
      prev.map(f => 
        files.some(file => file.id === f.id) 
          ? {...f, status: 'failed', error: error instanceof Error ? error.message : 'Processing failed'}
          : f
      )
    );
    
    showNotification('error', 'Failed to process documents');
  }
};


  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: UploadedFile[] = [];

    fileArray.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        showNotification('error', `${file.name}: ${validationError}`);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'pending',
        url: ''
      };

      newFiles.push(uploadedFile);
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      processAndUpsertFiles(newFiles);
    }
  }, [user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const removeUrl = (urlId: string) => {
    setProcessedUrls(prev => prev.filter(u => u.id !== urlId));
  };

  const getStatusIcon = (status: 'pending' | 'processing' | 'completed' | 'failed') => {
    switch (status) {
      case 'completed': 
        return (
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'failed': 
        return (
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'processing': 
        return (
          <div className="w-5 h-5">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-200 border-t-orange-600"></div>
          </div>
        );
      default: 
        return (
          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        );
    }
  };

  const getStatusText = (status: 'pending' | 'processing' | 'completed' | 'failed') => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-200">
              Upload Documents
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Upload your documents or process URLs to add them to your knowledge base
            </p>
          </div>

          {/* URL Input Section */}
          <div className="dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold dark:text-slate-200 text-black">
                  Process URL
                </h3>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter a URL to extract and process its content
              </p>
              
              <div className="flex space-x-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-slate-800 text-black dark:text-slate-200 
                           placeholder-gray-400 dark:placeholder-slate-400
                           focus:ring-2 focus:ring-orange-500 focus:border-transparent
                           transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 
                           text-white font-semibold rounded-lg
                           hover:from-orange-700 hover:to-orange-600
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Process</span>
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold dark:text-slate-200 text-black">
                  Upload Files
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload your documents directly from your device
              </p>
            </div>

            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${isDragOver 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <div>
                  <p className="text-lg font-medium dark:text-slate-200 text-black">
                    Drop files here or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    PDF, Word, Text files • Max 50MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Processed URLs List */}
          {(processedUrls.length > 0 || isLoadingDocs) && (
          <div className="dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-slate-200 text-black">
                Processed URLs {!isLoadingDocs && `(${processedUrls.length})`}
              </h2>
            </div>
            
            {isLoadingDocs ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading your documents...</p>
              </div>
            ) : processedUrls.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">No URLs processed yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Your existing processedUrls.map() code here */}
                {processedUrls.map(processedUrl => (
                  <div key={processedUrl.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getStatusIcon(processedUrl.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium dark:text-slate-200 text-black truncate text-sm">
                            {processedUrl.title || processedUrl.url}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="truncate max-w-xs">{processedUrl.url}</span>
                            <span>•</span>
                            <span>{getStatusText(processedUrl.status)}</span>
                            {processedUrl.extractedText && (
                              <>
                                <span>•</span>
                                <span>{processedUrl.extractedText.length.toLocaleString()} chars</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {processedUrl.status === 'failed' || processedUrl.status === 'pending' ? (
                          <button
                            onClick={() => removeUrl(processedUrl.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {processedUrl.error && (
                      <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                        {processedUrl.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          {/* {processedUrls.length > 0 && (
            <div className="dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold dark:text-slate-200 text-black">
                  Processed URLs ({processedUrls.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {processedUrls.map(processedUrl => (
                  <div key={processedUrl.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getStatusIcon(processedUrl.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium dark:text-slate-200 text-black truncate text-sm">
                            {processedUrl.title || processedUrl.url}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="truncate max-w-xs">{processedUrl.url}</span>
                            <span>•</span>
                            <span>{getStatusText(processedUrl.status)}</span>
                            {processedUrl.extractedText && (
                              <>
                                <span>•</span>
                                <span>{processedUrl.extractedText.length.toLocaleString()} chars</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {processedUrl.status === 'failed' || processedUrl.status === 'pending' ? (
                          <button
                            onClick={() => removeUrl(processedUrl.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {processedUrl.error && (
                      <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                        {processedUrl.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold dark:text-slate-200 text-black">
                  Uploaded Documents ({uploadedFiles.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {uploadedFiles.map(uploadedFile => (
                  <div key={uploadedFile.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getStatusIcon(uploadedFile.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium dark:text-slate-200 text-black truncate text-sm">
                            {uploadedFile.file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>{uploadedFile.url}</span>
                            <span>•</span>
                            <span>{getStatusText(uploadedFile.status)}</span>
                            {uploadedFile.extractedText && (
                              <>
                                <span>•</span>
                                <span>{uploadedFile.extractedText.length.toLocaleString()} chars</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {uploadedFile.status === 'failed' || uploadedFile.status === 'pending' ? (
                          <button
                            onClick={() => removeFile(uploadedFile.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {uploadedFile.error && (
                      <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                        {uploadedFile.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert Notification */}
          {showAlert && (
            <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
              <div className={`
                px-4 py-3 rounded-lg shadow-lg border max-w-sm
                ${showAlert.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' 
                  : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                }
              `}>
                <div className="flex items-center space-x-2">
                  <svg 
                    className="w-5 h-5 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    {showAlert.type === 'success' ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="text-sm font-medium">{showAlert.message}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentUploadPage;