import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiLogOut, FiHome, FiList, FiSettings } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">IT</span>
              </div>
              <span className="text-white text-xl font-bold">Incident Manager</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-1 transition"
            >
              <FiHome />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-1 transition"
                >
                  <FiList />
                  <span>Dashboard</span>
                </Link>

                {hasRole('ROLE_ADMIN') && (
                  <Link
                    href="/admin"
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-1 transition"
                  >
                    <FiSettings />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 text-white">
                  <FiUser />
                  <span className="hidden sm:inline">{user?.fullName}</span>
                </div>

                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-1 transition"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:bg-blue-700 px-4 py-2 rounded-md transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md font-semibold transition"
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
