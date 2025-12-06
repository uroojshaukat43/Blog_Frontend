import { useState } from 'react';
import { commentsAPI } from '../../utils/api';

const CommentsSection = ({ comments, onAddComment, onDeleteComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Comments</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-gray-600">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-gray-800">
                    {comment.authorName}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {(currentUser?.id === comment.author?._id || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => onDeleteComment(comment._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;









