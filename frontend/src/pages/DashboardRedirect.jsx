import React from 'react';
import { useAuth } from '../context/AuthContext';
import HotelDashboardPage from './HotelDashboardPage';
import MyBookingsPage from './MyBookingsPage';

function DashboardRedirect() {
    const { isManager, authLoading } = useAuth();

    // Wait for AuthContext to finish checking manager status on app load
    if (authLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#003366', fontSize: '1.1rem' }}>
                Loading your dashboard...
            </div>
        );
    }

    return isManager ? <HotelDashboardPage /> : <MyBookingsPage />;
}

export default DashboardRedirect;
