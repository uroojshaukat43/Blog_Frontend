import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI, getImageUrl } from '../utils/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll();
      if (response && response.data) {
        setPosts(response.data);
      } else {
        console.error('Invalid response format:', response);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Error details:', error.response?.data || error.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = (postId) => {
    if (isAuthenticated) {
      navigate(`/post/${postId}`);
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 text-lg">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Welcome to MERN Blog
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No blog posts available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.image && (
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.content}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">
                    By {post.authorName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleViewMore(post._id)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
                >
                  View More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;








