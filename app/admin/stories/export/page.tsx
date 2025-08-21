// app/admin/stories/export/page.tsx (Fixed)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import {
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  FileText,
  Users,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExportConfig {
  format: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: {
    status: string;
    includeContent: boolean;
    includeComments: boolean;
    includeAuthorInfo: boolean;
    includeStats: boolean;
  };
  fields: {
    basic: boolean;
    metadata: boolean;
    progress: boolean;
    competition: boolean;
  };
}

export default function StoriesExportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      startDate: '',
      endDate: '',
    },
    filters: {
      status: 'all',
      includeContent: false,
      includeComments: false,
      includeAuthorInfo: true,
      includeStats: true,
    },
    fields: {
      basic: true,
      metadata: true,
      progress: true,
      competition: false,
    },
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  const handleExport = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      // Add filters
      if (exportConfig.filters.status !== 'all') {
        params.append('status', exportConfig.filters.status);
      }
      if (exportConfig.dateRange.startDate) {
        params.append('startDate', exportConfig.dateRange.startDate);
      }
      if (exportConfig.dateRange.endDate) {
        params.append('endDate', exportConfig.dateRange.endDate);
      }

      // Add field selections
      params.append(
        'includeContent',
        exportConfig.filters.includeContent.toString()
      );
      params.append(
        'includeComments',
        exportConfig.filters.includeComments.toString()
      );
      params.append(
        'includeAuthorInfo',
        exportConfig.filters.includeAuthorInfo.toString()
      );
      params.append('format', exportConfig.format);

      const response = await fetch(`/api/admin/stories/export?${params}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const extension = exportConfig.format === 'json' ? 'json' : 'csv';
      a.download = `stories-bulk-export-${new Date().toISOString().split('T')[0]}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToastMessage('Export completed successfully!');
    } catch (error) {
      console.error('Error exporting stories:', error);
      setToastMessage('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (
    section: keyof ExportConfig,
    field: string,
    value: any
  ) => {
    if (section === 'format') {
      setExportConfig((prev) => ({
        ...prev,
        format: value,
      }));
    } else {
      setExportConfig((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  return (
    <ToastProvider>
      <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/stories">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white">
              Bulk Story Export
            </h1>
            <p className="text-gray-400">
              Configure and export story data in bulk
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800  p-6"
            >
              <h3 className="text-lg  text-white mb-4 flex items-center">
                <FileText size={20} className="mr-2" />
                Export Format
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 bg-gray-700/50  cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportConfig.format === 'csv'}
                    onChange={(e) =>
                      handleConfigChange('format', '', e.target.value)
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="text-white ">CSV Format</div>
                    <div className="text-gray-400 text-sm">
                      Comma-separated values, Excel compatible
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-gray-700/50  cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={exportConfig.format === 'json'}
                    onChange={(e) =>
                      handleConfigChange('format', '', e.target.value)
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="text-white ">JSON Format</div>
                    <div className="text-gray-400 text-sm">
                      Structured data, developer friendly
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Date Range */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800  p-6"
            >
              <h3 className="text-lg  text-white mb-4 flex items-center">
                <Calendar size={20} className="mr-2" />
                Date Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportConfig.dateRange.startDate}
                    onChange={(e) =>
                      handleConfigChange(
                        'dateRange',
                        'startDate',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exportConfig.dateRange.endDate}
                    onChange={(e) =>
                      handleConfigChange('dateRange', 'endDate', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800  p-6"
            >
              <h3 className="text-lg  text-white mb-4 flex items-center">
                <Filter size={20} className="mr-2" />
                Content Filters
              </h3>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Story Status
                  </label>
                  <select
                    value={exportConfig.filters.status}
                    onChange={(e) =>
                      handleConfigChange('filters', 'status', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Stories</option>
                    <option value="active">Active Stories</option>
                    <option value="completed">Completed Stories</option>
                    <option value="paused">Paused Stories</option>
                  </select>
                </div>

                {/* Include Options */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.filters.includeAuthorInfo}
                      onChange={(e) =>
                        handleConfigChange(
                          'filters',
                          'includeAuthorInfo',
                          e.target.checked
                        )
                      }
                      className="mr-3 "
                    />
                    <span className="text-white">
                      Include Author Information
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.filters.includeStats}
                      onChange={(e) =>
                        handleConfigChange(
                          'filters',
                          'includeStats',
                          e.target.checked
                        )
                      }
                      className="mr-3 "
                    />
                    <span className="text-white">Include Story Statistics</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.filters.includeContent}
                      onChange={(e) =>
                        handleConfigChange(
                          'filters',
                          'includeContent',
                          e.target.checked
                        )
                      }
                      className="mr-3 "
                    />
                    <span className="text-white">Include Story Content</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportConfig.filters.includeComments}
                      onChange={(e) =>
                        handleConfigChange(
                          'filters',
                          'includeComments',
                          e.target.checked
                        )
                      }
                      className="mr-3 "
                    />
                    <span className="text-white">Include Comments</span>
                  </label>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Export Summary & Action */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800  p-6"
            >
              <h3 className="text-lg  text-white mb-4 flex items-center">
                <BookOpen size={20} className="mr-2" />
                Export Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/50 ">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white  uppercase">
                    {exportConfig.format}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700/50 ">
                  <span className="text-gray-400">Status Filter:</span>
                  <span className="text-white  capitalize">
                    {exportConfig.filters.status === 'all'
                      ? 'All Stories'
                      : exportConfig.filters.status}
                  </span>
                </div>

                {exportConfig.dateRange.startDate && (
                  <div className="flex justify-between items-center p-3 bg-gray-700/50 ">
                    <span className="text-gray-400">Date Range:</span>
                    <span className="text-white  text-sm">
                      {exportConfig.dateRange.startDate} -{' '}
                      {exportConfig.dateRange.endDate || 'Now'}
                    </span>
                  </div>
                )}

                <div className="p-3 bg-gray-700/50 ">
                  <span className="text-gray-400 block mb-2">
                    Included Data:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {exportConfig.filters.includeAuthorInfo && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs ">
                        Author Info
                      </span>
                    )}
                    {exportConfig.filters.includeStats && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs ">
                        Statistics
                      </span>
                    )}
                    {exportConfig.filters.includeContent && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs ">
                        Content
                      </span>
                    )}
                    {exportConfig.filters.includeComments && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs ">
                        Comments
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Export Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800  p-6"
            >
              <h3 className="text-lg  text-white mb-4">Ready to Export</h3>

              <div className="bg-blue-900/20 border border-blue-500/30  p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  📊 Your export will include all stories matching your
                  criteria. Large exports may take a few minutes to process.
                </p>
              </div>

              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6  hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center  disabled:opacity-50"
              >
                <Download size={20} className="mr-2" />
                {loading ? 'Exporting...' : 'Export Stories'}
              </button>
            </motion.div>
          </div>
        </div>

        {toastMessage && (
          <Toast>
            <ToastTitle>
              {toastMessage.includes('successfully') ? 'Success' : 'Error'}
            </ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
            <ToastClose onClick={() => setToastMessage(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
