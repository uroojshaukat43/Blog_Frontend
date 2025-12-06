import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, getImageUrl } from '../../utils/api';

const UserDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [otherPosts, setOtherPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my-posts'); // 'my-posts' or 'all-posts'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchPosts();
  }, [isAuthenticated, navigate]);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getAll();
      const allPosts = response.data;

      // Separate my posts from other users' posts
      const myPostsList = allPosts.filter((post) => {
        if (!post.author) return false;
        const authorId = typeof post.author === 'object' ? post.author._id : post.author;
        return authorId === user.id || authorId === user._id;
      });
      const otherPostsList = allPosts.filter((post) => {
        if (!post.author) return true;
        const authorId = typeof post.author === 'object' ? post.author._id : post.author;
        return authorId !== user.id && authorId !== user._id;
      });

      setMyPosts(myPostsList);
      setOtherPosts(otherPostsList);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({
        ...formData,
        image: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingPost) {
        await postsAPI.update(editingPost._id, formDataToSend);
      } else {
        await postsAPI.create(formDataToSend);
      }

      setShowModal(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', image: null });
      fetchPosts();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save post');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postsAPI.delete(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '', image: null });
    setShowModal(true);
  };

  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Dashboard</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Create New Post
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('my-posts')}
            className={`pb-4 px-4 font-semibold ${
              activeTab === 'my-posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Posts ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('all-posts')}
            className={`pb-4 px-4 font-semibold ${
              activeTab === 'all-posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Posts ({otherPosts.length})
          </button>
        </div>
      </div>

      {/* My Posts Tab */}
      {activeTab === 'my-posts' && (
        <>
          {myPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                You haven't created any posts yet. Create your first post!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {post.image && (
                    <img
                      src={getImageUrl(post.image)}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex space-x-2 gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* All Posts Tab (Read-only) */}
      {activeTab === 'all-posts' && (
        <>
          {otherPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No posts from other users yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {post.image && (
                    <img
                      src={getImageUrl(post.image)}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-800">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        By {post.authorName || (post.author && post.author.username)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewPost(post._id)}
                      className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 font-semibold"
                    >
                      View Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="image"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {!editingPost && formData.image && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

