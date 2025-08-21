// Mentor Story Detail Page with Comments
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  Edit,
  Trash2,
} from 'lucide-react';
import TerminalLoader from '@/components/TerminalLoader';

interface Comment {
  _id: string;
  comment?: string; // legacy, optional
  content?: string; // new, required for new comments
  commentType: string;
  createdAt: string;
  updatedAt: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

interface Story {
  _id: string;
  title: string;
  status: string;
  updatedAt: string;
  totalWords: number;
  content?: string;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
}

export default function MentorStoryDetail() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/mentor/stories/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setStory(data.story);
          setComments(data.comments || []);
        } else {
          setStory(null);
        }
      } catch (e) {
        setStory(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [params.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/mentor/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story?._id, comment: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (e) {}
  };

  const handleEditClick = (comment: Comment) => {
    setEditingId(comment._id);
    setEditValue(comment.content ?? comment.comment ?? '');
  };

  const handleEditSave = async (comment: Comment) => {
    try {
      const res = await fetch(`/api/mentor/comments/${comment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: editValue }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === comment._id ? { ...c, comment: editValue } : c
          )
        );
        setEditingId(null);
        setEditValue('');
      }
    } catch (e) {}
  };

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/mentor/comments/${comment._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== comment._id));
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <TerminalLoader
          title="Stories"
          loadingText="Loading story..."
          size="md"
        />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl text-gray-400 mb-2">Story not found</h3>
        <Link href="/mentor-dashboard/stories">
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors">
            Back to Stories
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Link href="/mentor-dashboard/stories">
          <button className="text-gray-800 hover:text-blue-600 transition-colors bg-white p-2 text-xs sm:text-base">
            ← Back To Stories
          </button>
        </Link>
      </div>

      {/* Story Content */}
      <div className="bg-gray-800 p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
          <span className="px-2 py-1 text-xs border bg-blue-500/20 text-blue-300 border-blue-500/30">
            {story.status}
          </span>
          <span className="text-gray-400 text-xs">
            {story.totalWords} words
          </span>
          <Calendar className="w-4 h-4 ml-2 sm:ml-4" />
          <span className="text-gray-400 text-xs">
            Updated: {new Date(story.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="text-white whitespace-pre-line text-sm sm:text-base mt-2 sm:mt-4">
          {story.content}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-800 p-3 sm:p-6">
        <h3 className="text-base sm:text-lg text-white mb-2 sm:mb-4">
          Comments & Reviews
        </h3>
        {/* Add Comment */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-700 border border-gray-600 px-2 sm:px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-base"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 hover:bg-blue-700 transition-colors text-xs sm:text-base"
          >
            Add
          </button>
        </div>
        {/* Comments List */}
        <div className="space-y-3 sm:space-y-4">
          {comments.length === 0 && (
            <p className="text-gray-400 text-xs sm:text-sm">No comments yet.</p>
          )}
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 bg-gray-700/50 p-2 sm:p-3"
            >
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="text-white text-xs sm:text-sm">
                    {comment.authorId?.firstName} {comment.authorId?.lastName}
                  </span>
                  <span className="text-gray-400 text-[10px] sm:text-xs">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {editingId === comment._id ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 px-2 sm:px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-base"
                    />
                    <button
                      onClick={() => handleEditSave(comment)}
                      className="bg-green-600 text-white px-2 sm:px-3 py-1 hover:bg-green-700 transition-colors text-xs sm:text-base"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-600 text-white px-2 sm:px-3 py-1 hover:bg-gray-700 transition-colors text-xs sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-200 mt-2 text-xs sm:text-base">
                    {comment.content}
                  </p>
                )}
              </div>
              <div className="flex flex-row sm:flex-col gap-1 sm:gap-1 mt-2 sm:mt-0">
                <button
                  onClick={() => handleEditClick(comment)}
                  className="text-yellow-400 hover:text-yellow-300 p-1"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(comment)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
