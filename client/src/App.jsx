import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import CreateComplaint from './pages/CreateComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import UsersPage from './pages/Users';
import BlocksPage from './pages/Blocks';
import AdminApprovals from './pages/AdminApprovals';

import Home from './pages/Home';
import PendingApproval from './pages/PendingApproval';

export default function App() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div className="loader-container"><div className="loader" /></div>;
    }

    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/pending-approval" element={
                <ProtectedRoute allowPending={true}>
                    {user?.isApproved ? <Navigate to="/dashboard" /> : <PendingApproval />}
                </ProtectedRoute>
            } />

            {/* Protected */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />
                <Route path="/complaints/new" element={
                    <ProtectedRoute roles={['RESIDENT']}>
                        <CreateComplaint />
                    </ProtectedRoute>
                } />
                <Route path="/users" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <UsersPage />
                    </ProtectedRoute>
                } />
                <Route path="/approvals" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <AdminApprovals />
                    </ProtectedRoute>
                } />
                <Route path="/blocks" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <BlocksPage />
                    </ProtectedRoute>
                } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
        </Routes>
    );
}
