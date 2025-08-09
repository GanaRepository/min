// app/admin/stories/[id]/page.tsx - COMPLETE FIXED VERSION WITH COMMENT TYPE SELECTOR
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
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryDetails {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'paused';
  storyNumber: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
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
    comment: string;
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

type CommentType = 'general' | 'grammar' | 'creativity' | 'structure' | 'suggestion' | 'admin_feedback';

const commentTypeOptions: { value: CommentType; label: string; description: string }[] = [
  { value: 'general', label: 'General', description: 'General feedback and comments' },
  { value: 'grammar', label: 'Grammar', description: 'Grammar and language corrections' },
  { value: 'creativity', label: 'Creativity', description: 'Creative writing feedback' },
  { value: 'structure', label: 'Structure', description: 'Story structure and organization' },
  { value: 'suggestion', label: 'Suggestion', description: 'Suggestions for improvement' },
  { value: 'admin_feedback', label: 'Admin Feedback', description: 'Administrative feedback and notes' },
];

export default function ViewStory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<StoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'comments' | 'details'>('content');
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
    if (!confirm(`Are you sure you want to delete "${story?.title}"? This action cannot be undone.`)) {
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

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setAddingComment(true);
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment,
          commentType: commentType
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh the story to get updated comments
        fetchStory();
        setNewComment('');
        setCommentType('general');
        alert('Comment added successfully!');
      } else {
        alert('Failed to add comment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'child': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'admin_feedback': return 'bg-red-100 text-red-800';
      case 'grammar': return 'bg-yellow-100 text-yellow-800';
      case 'creativity': return 'bg-purple-100 text-purple-800';
      case 'structure': return 'bg-blue-100 text-blue-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedCommentType = commentTypeOptions.find(option => option.value === commentType);

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/stories">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {story.title}
            </h1>
            <p className="text-gray-400">Story #{story.storyNumber} Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportStory}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <Link href={`/admin/stories/${storyId}/edit`}>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Edit size={16} className="mr-2" />
              Edit
            </button>
          </Link>
          <button
            onClick={deleteStory}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash2 size={16} className="mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Story Info Card */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Author</p>
              <Link href={`/admin/users/${story.childId._id}`}>
                <p className="text-white font-medium hover:text-blue-400 cursor-pointer">
                  {story.childId.firstName} {story.childId.lastName}
                </p>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 rounded-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Word Count</p>
              <p className="text-white font-medium">{story.totalWords} words</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                {story.status}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-600 p-3 rounded-lg">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Created</p>
              <p className="text-white font-medium">
                {new Date(story.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 rounded-xl">
        <div className="flex border-b border-gray-700">
          {[
            { key: 'content', label: 'Story Content', icon: BookOpen },
            { key: 'comments', label: 'Comments', icon: MessageSquare },
            { key: 'details', label: 'Details', icon: Eye }
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
              <tab.icon size={16} />
              <span>{tab.label}</span>
              {tab.key === 'comments' && (
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  {story.comments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Story Content</h3>
              {story.turns.length > 0 ? (
                <div className="space-y-4">
                  {story.turns.map((turn, index) => (
                    <div key={index} className={`p-4 rounded-lg ${
                      turn.type === 'child' ? 'bg-blue-900/20 border-l-4 border-blue-500' : 'bg-gray-700/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          turn.type === 'child' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {turn.type === 'child' ? 'Child' : 'AI'} - Turn {turn.turnNumber}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(turn.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{turn.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No content available for this story.</p>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Comments & Feedback</h3>
                <span className="text-sm text-gray-400">
                  {story.comments.length} comment{story.comments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Add Comment Form */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Add Admin Comment</h4>
                
                {/* Comment Type Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Comment Type</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCommentTypeDropdown(!showCommentTypeDropdown)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCommentTypeColor(commentType)}`}>
                          {selectedCommentType?.label}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {selectedCommentType?.description}
                        </span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${showCommentTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showCommentTypeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
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
                              <span className={`px-2 py-1 text-xs rounded-full ${getCommentTypeColor(option.value)}`}>
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim() || addingComment}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} className="mr-2" />
                    {addingComment ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {story.comments.length > 0 ? (
                  story.comments.map((comment) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700/30 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {comment.authorId.firstName[0]}{comment.authorId.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-white font-medium text-sm">
                                {comment.authorId.firstName} {comment.authorId.lastName}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(comment.authorId.role)}`}>
                                {comment.authorId.role}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getCommentTypeColor(comment.commentType)}`}>
                                {commentTypeOptions.find(opt => opt.value === comment.commentType)?.label || comment.commentType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{comment.comment}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No comments yet. Be the first to add feedback!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Story Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Story ID</label>
                    <p className="text-white font-mono text-sm">{story._id}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">API Calls Used</label>
                    <p className="text-white">{story.apiCallsUsed} / {story.maxApiCalls}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((story.apiCallsUsed / story.maxApiCalls) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Total Words</label>
                    <p className="text-white">{story.totalWords}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Child Words</label>
                    <p className="text-white">{story.childWords}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Created</label>
                    <p className="text-white">{new Date(story.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Last Updated</label>
                    <p className="text-white">{new Date(story.updatedAt).toLocaleString()}</p>
                  </div>
                  
                  {story.completedAt && (
                    <div>
                      <label className="text-sm text-gray-400">Completed</label>
                      <p className="text-white">{new Date(story.completedAt).toLocaleString()}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm text-gray-400">Publication Status</label>
                    <p className="text-white">{story.isPublished ? 'Published' : 'Not Published'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Competition</label>
                    <p className="text-white">{story.submittedToCompetition ? 'Submitted' : 'Not Submitted'}</p>
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