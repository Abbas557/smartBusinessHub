import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8">
    <p className="text-8xl font-black text-gray-200 mb-4">404</p>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
    <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
  </div>
);

export default NotFoundPage;
