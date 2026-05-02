import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8">
    <p className="text-6xl mb-4">🔒</p>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
    <p className="text-gray-500 text-sm mb-6">You don't have permission to view this page.</p>
    <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
  </div>
);

export default UnauthorizedPage;
