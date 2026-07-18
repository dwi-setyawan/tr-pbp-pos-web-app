import { Navigate, Route, Routes } from 'react-router';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuManagementPage from './pages/MenuManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import ReportPage from './pages/ReportPage';
import TransactionPage from './pages/TransactionPage';

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/menu" element={<MenuManagementPage />} />
                        <Route path="/users" element={<UserManagementPage />} />
                        <Route path="/laporan" element={<ReportPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['owner', 'kasir']} />}>
                        <Route path="/transaksi" element={<TransactionPage />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
