// frontend/src/pages/HotelDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const BASE_URL = '/api/';
const MY_HOTEL_URL = '/api/hotels/my_hotel/';

// Component to handle adding a new room
const AddRoomForm = ({ hotelId, authTokens, onRoomAdded }) => {
    const [formData, setFormData] = useState({
        room_type: '',
        price_per_night: '',
        max_guests: '',
        total_rooms: '',
        hotel: hotelId 
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const payload = {
                ...formData,
                price_per_night: parseFloat(formData.price_per_night),
                max_guests: parseInt(formData.max_guests),
                total_rooms: parseInt(formData.total_rooms),
            };

            const response = await axios.post(`${BASE_URL}rooms/`, payload, {
                headers: {
                    Authorization: `Bearer ${authTokens.access}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                setMessage(`Room type added successfully!`);
                onRoomAdded(); 
                setFormData({
                    room_type: '',
                    price_per_night: '',
                    max_guests: '',
                    total_rooms: '',
                    hotel: hotelId
                });
            }
        } catch (error) {
            console.error("Failed to add room:", error.response?.data);
            setMessage(`Error: ${JSON.stringify(error.response?.data || error.message)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formHeader}>Add New Room Type</h3>
            {message && <p style={message.startsWith('Error') ? styles.errorMessage : styles.successMessage}>{message}</p>}
            
            <select name="room_type" value={formData.room_type} onChange={handleChange} required style={styles.input}>
                <option value="">-- Select Room Type --</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe</option>
            </select>

            <input name="price_per_night" value={formData.price_per_night} onChange={handleChange} placeholder="Price per Night" type="number" step="0.01" required style={styles.input} />
            <input name="max_guests" value={formData.max_guests} onChange={handleChange} placeholder="Max Guests" type="number" required style={styles.input} />
            <input name="total_rooms" value={formData.total_rooms} onChange={handleChange} placeholder="Total Rooms of this Type" type="number" required style={styles.input} />
            
            <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Adding...' : 'Save Room Type'}
            </button>
        </form>
    );
};

function HotelDashboardPage() {
    const { authTokens } = useAuth();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 1. Filter Date State: Defaults to today (YYYY-MM-DD)
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Send the filterDate as a query parameter to the backend
            const response = await axios.get(`${MY_HOTEL_URL}?date=${filterDate}`, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            
            setHotel(response.data);
            setRooms(response.data.rooms || []);
            setBookings(response.data.upcoming_bookings || []);
        } catch (err) {
            console.error(err);
            setError("Error fetching dashboard data. Ensure you are a hotel manager.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch data whenever tokens change, manual refresh happens, OR the filter date changes
    useEffect(() => {
        if (authTokens) {
            fetchDashboardData();
        } else {
            setLoading(false);
            setError("You must be logged in to view the dashboard.");
        }
    }, [authTokens, refreshTrigger, filterDate]); 

    if (loading) return <div style={styles.loading}>Loading Hotel Dashboard...</div>;
    if (error) return <div style={styles.errorContainer}>{error}</div>;
    if (!hotel) return <div style={styles.errorContainer}>No hotel data found.</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.mainHeader}>🏨 Dashboard for {hotel.name}</h1>
            <p style={styles.hotelInfo}>Location: {hotel.city}, {hotel.address}</p>

            <div style={styles.contentGrid}>
                {/* Section 1: Add Room Form */}
                <div style={styles.section}>
                    <AddRoomForm 
                        hotelId={hotel.id} 
                        authTokens={authTokens} 
                        onRoomAdded={() => setRefreshTrigger(prev => prev + 1)} 
                    />
                </div>

                {/* Section 2: Existing Rooms List */}
                <div style={styles.section}>
                    <h3 style={styles.sectionHeader}>Existing Room Types ({rooms.length})</h3>
                    <div style={styles.roomList}>
                        {rooms.length === 0 ? <p>No room types defined yet.</p> : 
                            rooms.map((room) => (
                                <div key={room.id} style={styles.roomCard}>
                                    <h4 style={{textTransform: 'capitalize'}}>{room.room_type}</h4>
                                    <p>Price: ₹{parseFloat(room.price_per_night).toFixed(2)} | Guests: {room.max_guests}</p>
                                    <p>Total Units: {room.total_rooms}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Section 3: Bookings Table with Date Filter */}
            <div style={{...styles.section, marginTop: '30px'}}>
                <div style={styles.filterHeader}>
                    <h3 style={styles.sectionHeader}>📅 Guest Bookings</h3>
                    <div style={styles.filterControls}>
                        <label style={{fontWeight: 'bold', marginRight: '10px'}}>Filter from:</label>
                        <input 
                            type="date" 
                            value={filterDate} 
                            onChange={(e) => setFilterDate(e.target.value)} 
                            style={styles.dateInput}
                        />
                        <button 
                            onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
                            style={styles.resetButton}
                        >
                            Today
                        </button>
                    </div>
                </div>

                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Guest Name</th>
                                <th style={styles.th}>Room Type</th>
                                <th style={styles.th}>Check-in</th>
                                <th style={styles.th}>Check-out</th>
                                <th style={styles.th}>Total Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? (
                                bookings.map((b) => (
                                    <tr key={b.id} style={styles.tr}>
                                        <td style={styles.td}>{b.guest_name}</td>
                                        <td style={styles.td}>{b.room_name}</td>
                                        <td style={styles.td}>{b.check_in_date}</td>
                                        <td style={styles.td}>{b.check_out_date}</td>
                                        <td style={styles.td}>₹{b.total_price}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{...styles.td, textAlign: 'center', padding: '20px'}}>
                                        No bookings found for the selected date onwards.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const ProtectedHotelDashboardPage = (props) => (
    <ProtectedRoute>
        <HotelDashboardPage {...props} />
    </ProtectedRoute>
);

export default ProtectedHotelDashboardPage;

const styles = {
    container: { maxWidth: '1100px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    mainHeader: { color: '#003366', borderBottom: '3px solid #ff6600', paddingBottom: '10px', marginBottom: '5px' },
    hotelInfo: { color: '#666', marginBottom: '30px', fontSize: '1.1rem' },
    loading: { textAlign: 'center', padding: '100px', fontSize: '1.2em', color: '#003366' },
    errorContainer: { textAlign: 'center', color: '#721c24', border: '1px solid #f5c6cb', padding: '25px', backgroundColor: '#f8d7da', borderRadius: '8px', margin: '50px auto', maxWidth: '600px' },
    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' },
    section: { padding: '20px', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fdfdfd' },
    sectionHeader: { color: '#ff6600', marginBottom: '10px', flex: 1 },
    filterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    filterControls: { display: 'flex', alignItems: 'center', gap: '10px' },
    dateInput: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' },
    resetButton: { padding: '8px 12px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    formHeader: { color: '#003366', fontSize: '1.2rem' },
    input: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' },
    button: { padding: '12px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
    errorMessage: { color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px' },
    successMessage: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px' },
    roomList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    roomCard: { padding: '15px', borderLeft: '5px solid #003366', borderRadius: '6px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: '#f4f4f4', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333' },
    td: { padding: '12px', borderBottom: '1px solid #eee', color: '#555' },
    tr: { transition: 'background 0.2s' }
};