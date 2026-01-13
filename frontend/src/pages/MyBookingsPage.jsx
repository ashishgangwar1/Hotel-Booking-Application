// frontend/src/pages/MyBookingsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // (You should have added this fix previously)

// VVVVVV ADD THIS CRITICAL IMPORT VVVVVV
import ProtectedRoute from '../components/ProtectedRoute'; 

const BASE_URL = '/api/';

// ... rest of the code ...

function MyBookingsPage() {
    const { authTokens, user, logoutUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user-specific bookings on component mount
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);

            // Check if tokens exist before making the call
            if (!authTokens) {
                setLoading(false);
                setError("You must be logged in to view bookings.");
                return;
            }

            try {
                const response = await axios.get(`${BASE_URL}bookings/`, {
                    headers: {
                        // CRITICAL: Include the Access Token for authentication
                        Authorization: `Bearer ${authTokens.access}`,
                    },
                });
                
                setBookings(response.data);
            } catch (err) {
                console.error("Error fetching bookings:", err.response || err);
                setError("Failed to load bookings. Your session may have expired.");
                // Optionally trigger logout if error is 401 Unauthorized
                if (err.response && err.response.status === 401) {
                    logoutUser();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [authTokens, logoutUser]); // Re-run effect if tokens change

    // frontend/src/pages/MyBookingsPage.jsx (Inside the MyBookingsPage function)

// ... (fetch logic and state definitions) ...

// --- Renders first if loading or an error occurred ---
    if (loading) return <div style={styles.loading}>Loading your booking history...</div>;
    if (error) return <div style={styles.errorContainer}>{error}</div>;

// --- THIS BLOCK IS CRITICAL ---
// If the API returns an empty array, we render the "No Bookings" message.
    if (bookings && bookings.length === 0) { 
        return (
            <div style={styles.container}>
                <h2 style={styles.header}>Your Bookings, {user}</h2>
                <div style={styles.noBookings}>
                    <p>You have no current or past bookings.</p>
                    <Link to="/" style={styles.link}>Start Searching for a Stay</Link>
                </div>
            </div>
        );
    }

// If execution reaches here, we know 'bookings' is a non-empty array,
// so the final block with the .map() function is executed.

// ... (Final return block with <h2>, <div>, and {bookings.map(...)}) ...

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Your Bookings, {user}</h2>
            
            {bookings.length === 0 ? (
                <div style={styles.noBookings}>
                    <p>You have no current or past bookings.</p>
                    <Link to="/" style={styles.link}>Start Searching for a Stay</Link>
                </div>
            ) : (
                <div style={styles.list}>
                    {bookings.map((booking) => (
                        <div key={booking.id} style={styles.card}>
                            <h3 style={styles.cardHeader}>{booking.room_name || 'Room Details Unavailable'}</h3>
                            <p><strong>Hotel/Room ID:</strong> {booking.room}</p>
                            <p><strong>Check-in:</strong> {booking.check_in_date}</p>
                            <p><strong>Check-out:</strong> {booking.check_out_date}</p>
                            <p><strong>Guests:</strong> {booking.num_guests}</p>
                            <p style={styles.price}><strong>Total Paid:</strong> ${parseFloat(booking.total_price).toFixed(2)}</p>
                            <p style={styles.status}>Booked On: {new Date(booking.booked_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// We wrap the component in ProtectedRoute for routing ease (see next step)
const ProtectedMyBookingsPage = (props) => (
    <ProtectedRoute>
        <MyBookingsPage {...props} />
    </ProtectedRoute>
);

export default ProtectedMyBookingsPage;

// --- Basic Inline Styling ---
const styles = {
    container: { maxWidth: '800px', margin: '50px auto', padding: '30px' },
    header: { color: '#003366', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    loading: { textAlign: 'center', padding: '50px' },
    errorContainer: { textAlign: 'center', color: 'red', border: '1px solid red', padding: '15px' },
    noBookings: { textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
    link: { color: '#ff6600', textDecoration: 'none', fontWeight: 'bold' },
    list: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    cardHeader: { color: '#ff6600', marginTop: 0 },
    price: { fontWeight: 'bold', fontSize: '1.2em', color: '#28a745' },
    status: { fontSize: '0.8em', color: '#666' }
};