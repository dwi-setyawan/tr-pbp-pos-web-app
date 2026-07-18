import { Navigate, Outlet } from 'react-router';
import { getCurrentUser } from '../lib/auth';

const ProtectedRoute = ({ allowedRoles }) => {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const fallback = user.role === 'owner' ? '/dashboard' : '/transaksi';
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
