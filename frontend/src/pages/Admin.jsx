import React from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Manage your community platform and monitor activity
          </p>
        </div>

        <div className="card max-w-2xl mx-auto">
          <div className="card-body text-center">
                          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gradient-warning)' }}>
              <svg className="w-12 h-12 text-[var(--color-dark-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Admin Panel Coming Soon
            </h2>
            <p className="text-text-secondary mb-8">
              We're building a comprehensive admin dashboard for you. 
              You'll be able to manage users, moderate content, and view analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="btn btn-primary"
              >
                Back to Home
              </Link>
              <Link
                to="/posts"
                className="btn btn-secondary"
              >
                View Posts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 