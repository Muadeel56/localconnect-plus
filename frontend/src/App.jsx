import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Loading from './components/Loading';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Lazy load other pages
const Posts = React.lazy(() => import('./pages/Posts'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const CreatePost = React.lazy(() => import('./pages/CreatePost'));
const EditPost = React.lazy(() => import('./pages/EditPost'));
const Comments = React.lazy(() => import('./pages/Comments'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Chat = React.lazy(() => import('./pages/Chat'));
const RoleManagement = React.lazy(() => import('./pages/RoleManagement'));
const Moderation = React.lazy(() => import('./pages/Moderation'));

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App min-h-screen bg-bg-primary text-text-primary">
            <Navigation />
            <main>
              <React.Suspense fallback={<Loading fullScreen text="Loading..." />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/request-password-reset" element={<RequestPasswordReset />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/posts/create" element={<CreatePost />} />
                  <Route path="/posts/:id" element={<PostDetail />} />
                  <Route path="/posts/:id/edit" element={<EditPost />} />
                  <Route path="/comments" element={<Comments />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/role-management" element={<RoleManagement />} />
                  <Route path="/moderation" element={<Moderation />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </React.Suspense>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--color-success-500)',
                    secondary: 'var(--color-dark-text)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--color-error-500)',
                    secondary: 'var(--color-dark-text)',
                  },
                },
              }}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
