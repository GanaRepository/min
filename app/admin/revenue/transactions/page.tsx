// app/admin/revenue/transactions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Filter,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Transaction {
  _id: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  transaction: {
    type: string;
    amount: number;
    purchaseDate: string;
    metadata?: any;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchTransactions();
  }, [session, status, router, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate);
      }

      const response = await fetch(`/api/admin/revenue/transactions?${params}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(
        `/api/admin/revenue/transactions/export?${params}`
      );
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  const applyDateFilter = () => {
    setPage(1);
    fetchTransactions();
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'story_pack':
        return 'bg-blue-100 text-blue-800';
      case 'story_publication':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/revenue">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Transaction History
            </h1>
            <p className="text-gray-400">
              Detailed transaction records and customer payments
            </p>
          </div>
        </div>
        <button
          onClick={exportTransactions}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-white font-medium">Date Range:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={applyDateFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                >
                  {/* Customer */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <Link href={`/admin/users/${transaction.customer.id}`}>
                          <h4 className="text-white font-medium hover:text-blue-400 cursor-pointer">
                            {transaction.customer.name}
                          </h4>
                        </Link>
                        <p className="text-xs text-gray-400">
                          {transaction.customer.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(transaction.transaction.type)}`}
                    >
                      {transaction.transaction.type === 'story_pack'
                        ? 'Story Pack'
                        : 'Publication'}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-emerald-400 mr-1" />
                      <span className="text-emerald-400 font-bold text-lg">
                        {transaction.transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white">
                        {new Date(
                          transaction.transaction.purchaseDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(
                          transaction.transaction.purchaseDate
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </td>

                  {/* Details */}
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-400">
                      {transaction.transaction.type === 'story_pack' &&
                        transaction.transaction.metadata && (
                          <span>
                            +{transaction.transaction.metadata.storiesAdded}{' '}
                            stories, +
                            {transaction.transaction.metadata.assessmentsAdded}{' '}
                            assessments
                          </span>
                        )}
                      {transaction.transaction.type === 'story_publication' &&
                        transaction.transaction.metadata?.storyTitle && (
                          <span>
                            "{transaction.transaction.metadata.storyTitle}"
                          </span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {transactions.length === 0 && !loading && (
          <div className="text-center py-12">
            <DollarSign size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              No transactions found
            </h3>
            <p className="text-gray-500">
              {dateRange.startDate || dateRange.endDate
                ? 'Try adjusting your date range'
                : 'Transactions will appear here as customers make purchases'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum =
                Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary */}
      {pagination && (
        <div className="text-center text-gray-400 text-sm">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} transactions
        </div>
      )}
    </div>
  );
}
