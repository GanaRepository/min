// app/admin/stories/[id]/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  User,
  Calendar,
  BookOpen,
  MessageSquare,
  Award,
  Download,
  Send,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryDetails {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'paused' | 'flagged' | 'review';
  totalWords: number;
  childWords: number;
  aiWords: number;
  currentTurn: number;
  maxApiCalls: number;
  apiCallsUsed: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  submittedToCompetition: boolean;
  competitionScore?: number;
  competitionRank?: number;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  turns: Array<{
    turnNumber: number;
    type: 'child' | 'ai';
    content: string;
    createdAt: string;
  }>;
  comments: Array<{
    _id: string;
    content: string;        // ✅ FIXED: Changed from 'comment' to 'content'
    commentType: string;
    authorId: {
      _id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    createdAt: string;
    isResolved: boolean;
  }>;
}

type CommentType =
  | 'general'
  | 'grammar'
  | 'creativity'
  | 'structure'
  | 'suggestion'
  | 'admin_feedback';

const commentTypeOptions: {
  value: CommentType;
  label: string;
  description: string;
}[] = [
  {
    value: 'general',
    label: 'General',
    description: 'General feedback and comments',
  },
  {
    value: 'grammar',
    label: 'Grammar',
    description: 'Grammar and language corrections',
  },
  {
    value: 'creativity',
    label: 'Creativity',
    description: 'Creative writing feedback',
  },
  {
    value: 'structure',
    label: 'Structure',
    description: 'Story structure and organization',
  },
  {
    value: 'suggestion',
    label: 'Suggestion',
    description: 'Suggestions for improvement',
  },
  {
    value: 'admin_feedback',
    label: 'Admin Feedback',
    description: 'Administrative feedback and notes',
  },
];

export default function ViewStory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<StoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'content' | 'comments' | 'details'
  >('content');
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('general');
  const [addingComment, setAddingComment] = useState(false);
  const [showCommentTypeDropdown, setShowCommentTypeDropdown] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchStory();
  }, [session, status, router, storyId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}`);
      const data = await response.json();

      if (data.success) {
        setStory(data.story);
      } else {
        router.push('/admin/stories');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      router.push('/admin/stories');
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${story?.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Story deleted successfully');
        router.push('/admin/stories');
      } else {
        alert('Failed to delete story: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    } finally {
      setDeleting(false);
    }
  };

  // ✅ FIXED: Complete addComment function using admin API
  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      
      // ✅ FIXED: Use admin comments API instead of general stories API
      const response = await fetch(`/api/admin/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: storyId,           // ✅ Pass storyId as separate field
          content: newComment,        // ✅ Use 'content' field (not 'comment')
          commentType: commentType,   // ✅ Include comment type
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the story to get updated comments
        fetchStory();
        setNewComment('');
        setCommentType('general');
        alert('Admin comment added successfully!');
      } else {
        alert('Failed to add comment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding admin comment:', error);
      alert('Failed to add admin comment');
    } finally {
      setAddingComment(false);
    }
  };

  const exportStory = async () => {
    try {
      const response = await fetch(`/api/stories/export/${storyId}/txt`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'story'}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting story:', error);
      alert('Failed to export story');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading story details...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Story not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mentor':
        return 'bg-purple-100 text-purple-800';
      case 'child':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'admin_feedback':
        return 'bg-red-100 text-red-800';
      case 'grammar':
        return 'bg-yellow-100 text-yellow-800';
      case 'creativity':
        return 'bg-purple-100 text-purple-800';
      case 'structure':
        return 'bg-blue-100 text-blue-800';
      case 'suggestion':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedCommentType = commentTypeOptions.find(
    (option) => option.value === commentType
  );

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/stories">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white">
              {story.title}
            </h1>
            <p className="text-gray-400">Story #{story._id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/admin/stories/${storyId}/edit`}>
            <button className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors flex items-center">
              <Edit size={16} className="mr-2" />
              Edit
            </button>
          </Link>
          <button
            onClick={exportStory}
            className="bg-green-600 text-white px-4 py-2  hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <button
            onClick={deleteStory}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash2 size={16} className="mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Story Info Card */}
      <div className="bg-gray-800  p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 ">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Author</p>
              <Link href={`/admin/users/${story.childId._id}`}>
                <p className="text-white  hover:text-blue-400 cursor-pointer">
                  {story.childId.firstName} {story.childId.lastName}
                </p>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 ">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Word Count</p>
              <p className="text-white ">{story.totalWords} words</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 ">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5  text-xs  ${getStatusColor(story.status)}`}
              >
                {story.status}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-yellow-600 p-3 ">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Created</p>
              <p className="text-white ">
                {new Date(story.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 ">
        <div className="flex border-b border-gray-700">
          {[
            { key: 'content', label: 'Story Content', icon: BookOpen },
            { key: 'comments', label: 'Comments', icon: MessageSquare },
            { key: 'details', label: 'Details', icon: Eye },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {story.turns && story.turns.length > 0 ? (
                <div className="space-y-4">
                  {story.turns.map((turn, index) => (
                    <div
                      key={index}
                      className={`p-4  ${
                        turn.type === 'child'
                          ? 'bg-blue-900/20 border-l-4 border-blue-500'
                          : 'bg-purple-900/20 border-l-4 border-purple-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm  ${
                            turn.type === 'child' ? 'text-blue-400' : 'text-purple-400'
                          }`}
                        >
                          Turn {turn.turnNumber} - {turn.type === 'child' ? 'Child' : 'AI'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(turn.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{turn.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No story content available.
                </p>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg  text-white">
                  Comments & Feedback
                </h3>
                <span className="text-sm text-gray-400">
                  {story.comments.length} comment
                  {story.comments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Add Comment Form */}
              <div className="bg-gray-700/30  p-4">
                <h4 className="text-white  mb-3">
                  Add Admin Comment
                </h4>

                {/* Comment Type Selector */}
                <div className="mb-4">
                  <label className="block text-sm  text-gray-400 mb-2">
                    Comment Type
                  </label>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowCommentTypeDropdown(!showCommentTypeDropdown)
                      }
                      className="w-full bg-gray-700 border border-gray-600  px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs  ${getCommentTypeColor(commentType)}`}
                        >
                          {selectedCommentType?.label}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {selectedCommentType?.description}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          showCommentTypeDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showCommentTypeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600  shadow-lg">
                        {commentTypeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setCommentType(option.value);
                              setShowCommentTypeDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs  ${getCommentTypeColor(option.value)}`}
                              >
                                {option.label}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {option.description}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your feedback or comments about this story..."
                  className="w-full p-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim() || addingComment}
                    className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} className="mr-2" />
                    {addingComment ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {story.comments.length > 0 ? (
                  story.comments.map((comment, index) => (
                    <div key={comment._id} className="bg-gray-700/30  p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-white ">
                            {comment.authorId.firstName} {comment.authorId.lastName}
                          </span>
                          <span className={`px-2 py-1 text-xs  ${getRoleColor(comment.authorId.role)}`}>
                            {comment.authorId.role}
                          </span>
                          <span className={`px-2 py-1 text-xs  ${getCommentTypeColor(comment.commentType)}`}>
                            {comment.commentType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          {comment.isResolved ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <X size={16} className="text-red-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {comment.content}  {/* ✅ FIXED: Using comment.content instead of comment.comment */}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No comments yet. Add the first comment above.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30  p-4">
                  <h4 className="text-white  mb-3">Story Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Words:</span>
                      <span className="text-white">{story.totalWords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Child Words:</span>
                      <span className="text-white">{story.childWords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Words:</span>
                      <span className="text-white">{story.aiWords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Turn:</span>
                      <span className="text-white">{story.currentTurn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">API Calls Used:</span>
                      <span className="text-white">{story.apiCallsUsed}/{story.maxApiCalls}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/30  p-4">
                  <h4 className="text-white  mb-3">Publication Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Published:</span>
                      <span className={story.isPublished ? 'text-green-400' : 'text-red-400'}>
                        {story.isPublished ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Competition Entry:</span>
                      <span className={story.submittedToCompetition ? 'text-green-400' : 'text-red-400'}>
                        {story.submittedToCompetition ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {story.competitionScore && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Competition Score:</span>
                        <span className="text-white">{story.competitionScore}</span>
                      </div>
                    )}
                    {story.competitionRank && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Competition Rank:</span>
                        <span className="text-white">#{story.competitionRank}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}