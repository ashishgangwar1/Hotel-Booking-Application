// frontend/src/App.jsx — Updated with analytics routes

import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import HotelDetailPage from './pages/HotelDetailPage';
import ManagerBookingsPage from "./pages/ManagerBookingsPage";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './pages/DashboardRedirect';
import MyBookingsPage from './pages/MyBookingsPage';
import HotelDashboardPage from './pages/HotelDashboardPage';
import WishlistPage from './pages/WishlistPage';
import FavoritesPage from './pages/FavoritesPage';
import RevenuePage from './pages/RevenuePage';
import OccupancyPage from './pages/OccupancyPage';

function App() {
    return (
        <>
            <Header />
            <main className="container">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/hotel/:id" element={<HotelDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Customer Routes */}
                    <Route path="/booking/:roomId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
                    <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                    <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

                    {/* Manager / Admin Routes */}
                    <Route path="/manager-bookings" element={<ProtectedRoute><ManagerBookingsPage /></ProtectedRoute>} />
                    <Route path="/hotel-dashboard" element={<ProtectedRoute><HotelDashboardPage /></ProtectedRoute>} />

                    {/* ✅ New Analytics Routes — Manager/Admin only */}
                    <Route path="/analytics/revenue" element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />
                    <Route path="/analytics/occupancy" element={<ProtectedRoute><OccupancyPage /></ProtectedRoute>} />
                </Routes>
            </main>
        </>
    );
}

export default App;
