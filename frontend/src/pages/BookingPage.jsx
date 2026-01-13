// frontend/src/pages/BookingPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BASE_URL = '/api/';

function BookingPage() {
    const { authTokens } = useAuth();
    const { roomId } = useParams(); // Get the room ID from the URL
    const navigate = useNavigate();

    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        check_in_date: '',
        check_out_date: '',
        num_guests: 1,
    });
    const [submitStatus, setSubmitStatus] = useState({ message: null, success: false });

    // 1. Fetch Room Details (to show price, dates, etc.)
    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                // Fetch the specific room data (you might need a specific endpoint for this)
                // For now, let's assume /api/rooms/{id} exists in your Django setup
                const response = await axios.get(`${BASE_URL}rooms/${roomId}/`, {
                    headers: {
                        // Include the token for authenticated requests (even reads)
                        Authorization: `Bearer ${authTokens.access}`, 
                    },
                });
                setRoomDetails(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch room details:", error);
                setLoading(false);
                setRoomDetails(null);
            }
        };

        if (roomId && authTokens) {
            // Note: You need to implement the /api/rooms/{id}/ endpoint in Django
            // For now, we'll assume it exists. If it fails, we need to add it later.
            fetchRoomDetails();
        }
    }, [roomId, authTokens]);

    // Calculate total price based on dates and price_per_night
    const calculateTotalPrice = () => {
        if (!roomDetails || !bookingData.check_in_date || !bookingData.check_out_date) {
            return 0;
        }

        const checkIn = new Date(bookingData.check_in_date);
        const checkOut = new Date(bookingData.check_out_date);
        
        // Calculate number of nights
        const timeDiff = Math.abs(checkOut.getTime() - checkIn.getTime());
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (dayDiff <= 0) return 0;

        return (dayDiff * parseFloat(roomDetails.price_per_night)).toFixed(2);
    };

    const handleInputChange = (e) => {
        setBookingData({...bookingData, [e.target.name]: e.target.value});
    };

    // 2. Submit Booking (POST request)
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ message: 'Processing...', success: false });

        const totalPrice = calculateTotalPrice();
        if (totalPrice <= 0) {
            setSubmitStatus({ message: 'Please select valid check-in and check-out dates.', success: false });
            return;
        }

        try {
            const bookingPayload = {
                room: roomId, // Send the Foreign Key ID
                check_in_date: bookingData.check_in_date,
                check_out_date: bookingData.check_out_date,
                num_guests: bookingData.num_guests,
                total_price: totalPrice, // The backend should recalculate this, but send it anyway
            };

            const response = await axios.post(`${BASE_URL}bookings/`, bookingPayload, {
                headers: {
                    // CRITICAL: Send the Access Token
                    Authorization: `Bearer ${authTokens.access}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                setSubmitStatus({ message: 'Booking successful! Redirecting to home...', success: true });
                // Redirect user after success
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (error) {
            console.error("Booking submission failed:", error.response?.data);
            setSubmitStatus({ message: `Booking failed: ${JSON.stringify(error.response?.data)}`, success: false });
        }
    };

    if (loading) return <div style={styles.loading}>Loading room details...</div>;
    if (!roomDetails) return <div style={styles.loading}>Error loading room details or room not found.</div>;
    
    const totalPrice = calculateTotalPrice();

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Confirm Your Booking at {roomDetails.hotel_name || 'Hotel'}</h2>
            <div style={styles.summary}>
                <p>Room Type: <strong>{roomDetails.room_type}</strong></p>
                <p>Price per Night: <strong>${roomDetails.price_per_night}</strong></p>
            </div>

            <form onSubmit={handleBookingSubmit} style={styles.form}>
                
                {/* Check-in Date */}
                <label style={styles.label}>Check-in Date:</label>
                <input 
                    type="date" 
                    name="check_in_date" 
                    value={bookingData.check_in_date} 
                    onChange={handleInputChange} 
                    required 
                    style={styles.input}
                />

                {/* Check-out Date */}
                <label style={styles.label}>Check-out Date:</label>
                <input 
                    type="date" 
                    name="check_out_date" 
                    value={bookingData.check_out_date} 
                    onChange={handleInputChange} 
                    required 
                    style={styles.input}
                />

                {/* Number of Guests */}
                <label style={styles.label}>Number of Guests:</label>
                <input 
                    type="number" 
                    name="num_guests" 
                    min="1" 
                    max={roomDetails.max_guests} 
                    value={bookingData.num_guests} 
                    onChange={handleInputChange} 
                    required 
                    style={styles.input}
                />

                {/* Total Price Display */}
                <h3 style={styles.total}>Total Price: ${totalPrice}</h3>

                {/* Status Message */}
                {submitStatus.message && (
                    <p style={{...styles.status, backgroundColor: submitStatus.success ? '#d4edda' : '#f8d7da'}}>
                        {submitStatus.message}
                    </p>
                )}

                <button type="submit" disabled={submitStatus.message === 'Processing...'} style={styles.button}>
                    Confirm and Pay
                </button>
            </form>
        </div>
    );
}

export default BookingPage;

const styles = {
    container: { maxWidth: '600px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    header: { color: '#003366', textAlign: 'center', marginBottom: '20px' },
    loading: { textAlign: 'center', padding: '50px' },
    summary: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column' },
    label: { marginTop: '10px', marginBottom: '5px', fontWeight: 'bold' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '15px' },
    total: { textAlign: 'right', color: '#28a745', marginTop: '20px' },
    status: { padding: '10px', borderRadius: '4px', textAlign: 'center', border: '1px solid', marginBottom: '15px' },
    button: { padding: '12px', backgroundColor: '#ff6600', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};