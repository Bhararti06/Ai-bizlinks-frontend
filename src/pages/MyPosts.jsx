import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import dataService from '../services/dataService';
import { PlusIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            const response = await dataService.getMyPosts();
            setPosts(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch your posts');
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handleDeletePost = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await dataService.deletePost(id);
                setPosts(posts.filter(post => post.id !== id));
                toast.success('Post deleted successfully');
            } catch (error) {
                toast.error('Failed to delete post');
            }
        }
    };

    const handleUpdatePost = (id, updatedPost) => {
        setPosts(posts.map(post => post.id === id ? updatedPost : post));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
                    <p className="text-gray-500 mt-1">Manage and view stories you've shared with the community</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 font-bold"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create New Post
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-24 glass rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <NewspaperIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                You haven't shared any posts with your organization yet. Start the conversation today!
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-primary-600 font-bold hover:underline"
                            >
                                Publish your first post
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post, index) => (
                                <PostCard
                                    key={post.id}
                                    index={index}
                                    post={post}
                                    onDelete={handleDeletePost}
                                    onUpdate={handleUpdatePost}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={handlePostCreated}
            />
        </div>
    );
};

export default MyPosts;
