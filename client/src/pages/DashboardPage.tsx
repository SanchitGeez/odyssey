/**
 * Dashboard Page (Placeholder)
 */
import { useAuthStore } from '../lib/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome to Odyssey!</h1>
            <p className="text-gray-300">You're successfully logged in</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-surface p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-on-surface mb-4">Your Account</h2>
          <div className="space-y-2 text-on-surface">
            <p>
              <span className="font-semibold">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-semibold">User ID:</span> {user?.id}
            </p>
            <p>
              <span className="font-semibold">Account Status:</span>{' '}
              <span className="text-green-600 font-medium">
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p>
              <span className="font-semibold">Member Since:</span>{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-surface p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-bold text-on-surface mb-2">
            Dashboard Coming Soon! 🚀
          </h3>
          <p className="text-gray-600">
            The full Odyssey experience with task tracking, projects, and analytics will be here.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Phase 1 Authentication: ✅ Complete
          </div>
        </div>
      </div>
    </div>
  );
}
