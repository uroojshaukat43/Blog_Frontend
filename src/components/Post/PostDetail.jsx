import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, commentsAPI, getImageUrl } from '../../utils/api';
import CommentsSection from './CommentsSection';

const PostDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchPost();
    fetchComments();
  }, [id, isAuthenticated]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getById(id);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getByPost(id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (content) => {
    try {
      const response = await commentsAPI.create(id, content);
      setComments([response.data, ...comments]);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.delete(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 text-lg">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Post not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:text-blue-800 font-semibold"
      >
        ← Back to Home
      </button>

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.image && (
          <img
            src={getImageUrl(post.image)}
            alt={post.title}
            className="w-full h-96 object-cover"
          />
        )}
        
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            {post.title}
          </h1>
          
          <div className="flex items-center mb-6 text-gray-600">
            <span className="mr-4">By {post.authorName}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>
      </article>

      <CommentsSection
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        currentUser={user}
      />
    </div>
  );
};

export default PostDetail;








