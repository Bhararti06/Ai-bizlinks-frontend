import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import {
    HeartIcon as HeartIconOutline,
    ChatBubbleLeftIcon,
    TrashIcon,
    UserCircleIcon,
    EllipsisHorizontalIcon,
    HandThumbUpIcon as LikeIconOutline,
    FaceSmileIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, HandThumbUpIcon as LikeIconSolid } from '@heroicons/react/24/solid';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import UpdatePostModal from './UpdatePostModal';

const PostCard = ({ post, onDelete, onUpdate, index, id }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const commentInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const location = useLocation();

    React.useEffect(() => {
        if (location.state?.expandPostId === post.id) {
            loadComments();
        }
    }, [location.state?.expandPostId, post.id]);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            await dataService.toggleLike(post.id);
            onUpdate();
        } catch (error) {
            toast.error("Failed to update like");
        } finally {
            setIsLiking(false);
        }
    };

    const loadComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const response = await dataService.getComments(post.id);
                setComments(response.data.data);
            } catch (error) {
                toast.error("Failed to load comments");
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await dataService.addComment(post.id, newComment);
            setNewComment('');
            const response = await dataService.getComments(post.id);
            setComments(response.data.data);
            onUpdate();
            toast.success("Comment added");
        } catch (error) {
            toast.error("Failed to add comment");
        }
    };

    const handleCommentLike = async (commentId) => {
        try {
            await dataService.toggleCommentLike(commentId);
            // Refresh comments to get new like state
            const response = await dataService.getComments(post.id);
            setComments(response.data.data);
        } catch (error) {
            toast.error("Failed to like comment");
        }
    };

    const handleReplyClick = (userName) => {
        setNewComment(`@${userName} `);
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setNewComment(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    // Close emoji picker when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isLiked = post.user_liked;

    return (
        <div id={id} className="bg-white rounded-md shadow-sm border border-gray-100 mb-6 animate-in fade-in zoom-in-95 duration-500" style={{ overflow: 'visible' }}>
            {/* Author Header */}
            <div className="p-4 flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-50 flex-shrink-0">
                        {post.author_image ? (
                            <img src={post.author_image.startsWith('http') ? post.author_image : `${ASSETS_URL}${post.author_image}`} alt={post.author_name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <UserCircleIcon className="w-8 h-8 text-gray-300" />
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800">{post.author_name || post.user_name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>

                    {showOptions && (
                        <div className="absolute right-0 top-10 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {user.id === post.user_id && (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(true);
                                            setShowOptions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                        Edit Post
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete(post.id);
                                            setShowOptions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        Delete Post
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowOptions(false)}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Content (Always first) */}
            <div className="px-4 pb-3">
                <p className="text-[14px] text-gray-900 leading-normal whitespace-pre-wrap">
                    {(!isExpanded && post.description?.length > 210)
                        ? <>{post.description.slice(0, 210)}<button onClick={() => setIsExpanded(true)} className="text-gray-500 hover:text-gray-700 hover:underline font-semibold ml-1">...more</button></>
                        : post.description
                    }
                </p>
            </div>

            {/* Post Media (If exists) */}
            {post.image_path && (
                <div className="w-full bg-gray-50 border-y border-gray-100 overflow-hidden">
                    {post.image_path.toLowerCase().endsWith('.mp4') ? (
                        <video
                            src={post.image_path.startsWith('http') ? post.image_path : `${ASSETS_URL}${post.image_path}`}
                            controls
                            className="w-full h-auto max-h-[600px] object-contain mx-auto"
                        />
                    ) : (
                        <img
                            src={post.image_path.startsWith('http') ? post.image_path : `${ASSETS_URL}${post.image_path}`}
                            alt="Post"
                            className="w-full h-auto max-h-[600px] object-contain mx-auto"
                        />
                    )}
                </div>
            )}

            {/* Interaction Buttons */}
            <div className="px-4 py-2 flex items-center gap-6 border-t border-gray-100">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-xs font-semibold transition-colors py-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                    disabled={isLiking}
                >
                    {isLiked ? <HeartIconSolid className="h-4 w-4" /> : <HeartIconOutline className="h-4 w-4 interaction-icon" />}
                    <span>{post.like_count} Likes</span>
                </button>

                {/* Expansion trigger is the comment count */}
                <button
                    onClick={loadComments}
                    className={`flex items-center gap-2 text-xs font-semibold transition-colors py-1 ${showComments ? 'text-blue-500' : 'text-gray-500 hover:text-blue-700'}`}
                >
                    <ChatBubbleLeftIcon className="h-4 w-4 interaction-icon" />
                    <span>{post.comment_count} Comments</span>
                </button>
            </div>

            {/* Comments Section - Expanded only on click */}
            {showComments && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300 border-t border-gray-50 pt-4" style={{ overflow: 'visible', position: 'relative' }}>
                    <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {user?.profile_image ? (
                                <img src={`${ASSETS_URL}${user.profile_image}`} className="w-full h-full object-cover rounded-full" alt="Me" />
                            ) : (
                                <UserCircleIcon className="w-6 h-6 text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <div className="relative flex items-center bg-gray-50 rounded-full border border-transparent focus-within:border-blue-400">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="pl-3 pr-1 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FaceSmileIcon className="w-5 h-5" />
                                </button>
                                <input
                                    ref={commentInputRef}
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-transparent border-0 focus:ring-0 text-xs px-2 py-2"
                                />
                            </div>
                            {showEmojiPicker && (
                                <div ref={emojiPickerRef} className="absolute left-0 top-12 z-[9999] shadow-2xl rounded-lg bg-white">
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        width={320}
                                        height={400}
                                        searchDisabled
                                        skinTonesDisabled
                                        previewConfig={{ showPreview: false }}
                                    />
                                </div>
                            )}
                        </div>
                    </form>

                    <div className="space-y-5">
                        {loadingComments ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            </div>
                        ) : comments.map(comment => (
                            <div key={comment.id} className="flex gap-3 items-start group">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-50">
                                    {comment.user_image ? (
                                        <img src={`${ASSETS_URL}${comment.user_image}`} className="w-full h-full object-cover" alt={comment.user_name} />
                                    ) : (
                                        <UserCircleIcon className="w-full h-full text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-2xl px-4 py-2.5 relative">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-[12px] font-bold text-gray-900">{comment.user_name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <p className="text-[13px] text-gray-700 leading-normal">{comment.comment}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5 px-2">
                                        <button
                                            onClick={() => handleCommentLike(comment.id)}
                                            className={`text-[11px] font-bold flex items-center gap-1 transition-colors ${comment.user_liked ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
                                        >
                                            {comment.user_liked ? <LikeIconSolid className="w-3.5 h-3.5" /> : <LikeIconOutline className="w-3.5 h-3.5" />}
                                            <span>{comment.like_count > 0 ? comment.like_count : ''} Like</span>
                                        </button>
                                        <button
                                            onClick={() => handleReplyClick(comment.user_name)}
                                            className="text-[11px] font-bold text-gray-500 hover:text-primary-600 transition-colors"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Modals */}
            <UpdatePostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
                onPostUpdated={onUpdate}
            />
        </div>
    );
};

export default PostCard;

