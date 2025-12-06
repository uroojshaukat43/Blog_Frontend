import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:text-blue-200">
            MERN Blog
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/" className="hover:text-blue-200">
                  Home
                </Link>
                {isAdmin ? (
                  <Link to="/admin" className="hover:text-blue-200">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/user-dashboard" className="hover:text-blue-200">
                    My Dashboard
                  </Link>
                )}
                <span className="text-blue-200">
                  Welcome, {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-blue-200">
                  Home
                </Link>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;







