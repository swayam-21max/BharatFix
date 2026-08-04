import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles, allowPending = false }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Approval check for Block Heads
    if (user?.role === 'BLOCK_HEAD' && !user?.isApproved && !allowPending) {
        return <Navigate to="/pending-approval" replace />;
    }

    // Role check
    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
