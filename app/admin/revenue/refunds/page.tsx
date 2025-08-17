// app/admin/revenue/refunds/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  Check,
  X,
  Clock,
  User,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RefundRequest {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  transactionId: string;
}

export default function RefundsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchRefunds();
  }, [session, status, router, statusFilter]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/revenue/refunds?${params}`);
      const data = await response.json();

      if (data.success) {
        setRefunds(data.refunds);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (
    refundId: string,
    action: 'approve' | 'reject',
    reason?: string
  ) => {
    if (!confirm(`Are you sure you want to ${action} this refund request?`)) {
      return;
    }

    try {
      setProcessing(refundId);
      const response = await fetch('/api/admin/revenue/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundId,
          action,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchRefunds(); // Refresh data
      } else {
        alert('Failed to process refund: ' + data.error);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'approved':
        return Check;
      case 'rejected':
        return X;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/revenue">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl  text-white">
            Refund Management
          </h1>
          <p className="text-gray-400">
            Review and process customer refund requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800  p-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <div className="flex bg-gray-700  p-1">
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm   transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {refunds.map((refund) => {
          const StatusIcon = getStatusIcon(refund.status);
          return (
            <motion.div
              key={refund._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800  p-6"
            >
              <div className="flex items-start justify-between">
                {/* Refund Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-600  flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white ">
                        {refund.user.firstName} {refund.user.lastName}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {refund.user.email}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm   ${getStatusColor(refund.status)} flex items-center`}
                    >
                      <StatusIcon size={14} className="mr-1" />
                      {refund.status}
                    </span>
                  </div>

                  <div className="bg-gray-700/50  p-4 mb-4">
                    <h5 className="text-white  mb-2">
                      Refund Reason:
                    </h5>
                    <p className="text-gray-300">{refund.reason}</p>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-1 text-emerald-400" />
                      <span className="text-emerald-400  text-lg">
                        ${refund.amount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      Request Date:{' '}
                      {new Date(refund.requestDate).toLocaleString()}
                    </div>
                    <div>Transaction ID: {refund.transactionId}</div>
                  </div>
                </div>

                {/* Actions */}
                {refund.status === 'pending' && (
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => processRefund(refund._id, 'approve')}
                      disabled={processing === refund._id}
                      className="bg-green-600 text-white px-4 py-2  hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <Check size={16} className="mr-2" />
                      {processing === refund._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt(
                          'Reason for rejection (optional):'
                        );
                        if (reason !== null) {
                          processRefund(refund._id, 'reject', reason);
                        }
                      }}
                      disabled={processing === refund._id}
                      className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <X size={16} className="mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {refunds.length === 0 && !loading && (
        <div className="text-center py-12">
          <DollarSign size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl  text-gray-400 mb-2">
            No refund requests
          </h3>
          <p className="text-gray-500">
            {statusFilter !== 'all'
              ? `No ${statusFilter} refund requests at this time`
              : 'Refund requests will appear here when customers request them'}
          </p>
        </div>
      )}
    </div>
  );
}
