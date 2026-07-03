// frontend/src/pages/HotelDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const BASE_URL = '/api/';
const MY_HOTEL_URL = '/api/hotels/my-hotels/';

// ✅ Form 1 — Create RoomType
const AddRoomTypeForm = ({ hotelId, authTokens, onAdded }) => {
    const [formData, setFormData] = useState({
        name: '', capacity: '', price_per_night: '', hotel: hotelId
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const payload = {
                name: formData.name,
                capacity: parseInt(formData.capacity),
                price_per_night: parseFloat(formData.price_per_night),
                hotel: hotelId
            };
            await axios.post(`${BASE_URL}hotels/room-types/create/`, payload, {
                headers: { Authorization: `Bearer ${authTokens.access}`, 'Content-Type': 'application/json' }
            });
            setMessage('Room type created successfully!');
            onAdded();
            setFormData({ name: '', capacity: '', price_per_night: '', hotel: hotelId });
        } catch (err) {
            setMessage(`Error: ${JSON.stringify(err.response?.data || err.message)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formHeader}>➕ Create Room Type</h3>
            {message && <p style={message.startsWith('Error') ? styles.errorMessage : styles.successMessage}>{message}</p>}
            
            
                <select name="name" value={formData.name} onChange={handleChange} required style={styles.input}>
                    <option value="">-- Select Room Type --</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                    <option value="Deluxe">Deluxe</option>
                </select>
            <input name="capacity" value={formData.capacity} onChange={handleChange} placeholder="Capacity (max guests)" type="number" required style={styles.input} />
            <input name="price_per_night" value={formData.price_per_night} onChange={handleChange} placeholder="Price per Night (₹)" type="number" step="0.01" required style={styles.input} />
            <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Creating...' : 'Create Room Type'}</button>
        </form>
    );
};

// ✅ Form 2 — Create Room (uses RoomType ID from dropdown)
const AddRoomForm = ({ hotelId, authTokens, onAdded, roomTypes }) => {
    const [formData, setFormData] = useState({
        room_number: '', room_type: '', hotel: hotelId
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const payload = {
                room_number: formData.room_number,
                room_type: parseInt(formData.room_type), // ✅ send FK id
                hotel: hotelId
            };
            await axios.post(`${BASE_URL}hotels/manager/rooms/create/`, payload, {
                headers: { Authorization: `Bearer ${authTokens.access}`, 'Content-Type': 'application/json' }
            });
            setMessage('Room added successfully!');
            onAdded();
            setFormData({ room_number: '', room_type: '', hotel: hotelId });
        } catch (err) {
            setMessage(`Error: ${JSON.stringify(err.response?.data || err.message)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formHeader}>🛏️ Add Room</h3>
            {message && <p style={message.startsWith('Error') ? styles.errorMessage : styles.successMessage}>{message}</p>}
            <input name="room_number" value={formData.room_number} onChange={handleChange} placeholder="Room Number (e.g. 101)" required style={styles.input} />
            <select name="room_type" value={formData.room_type} onChange={handleChange} required style={styles.input}>
                <option value="">-- Select Room Type --</option>
                {roomTypes.length === 0
                    ? <option disabled>No room types yet — create one first</option>
                    : roomTypes.map(rt => (
                        <option key={rt.id} value={rt.id}>
                            {rt.name} — ₹{rt.price_per_night}/night (Capacity: {rt.capacity})
                        </option>
                    ))
                }
            </select>
            <button type="submit" disabled={loading || roomTypes.length === 0} style={styles.button}>
                {loading ? 'Adding...' : 'Add Room'}
            </button>
        </form>
    );
};

function HotelDashboardPage() {
    const { authTokens } = useAuth();

    const [allHotels, setAllHotels] = useState([]);
    const [selectedHotelId, setSelectedHotelId] = useState(null);
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    // Step 1: Fetch all hotels on mount
    const fetchAllHotels = async () => {
        try {
            const response = await axios.get(MY_HOTEL_URL, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            const hotels = Array.isArray(response.data) ? response.data : [response.data];
            if (hotels.length === 0) {
                setError("No hotels found. Please create a hotel first.");
                setLoading(false);
                return;
            }
            setAllHotels(hotels);
            setSelectedHotelId(hotels[0].id);
        } catch (err) {
            setError("Error fetching hotels. Ensure you are a hotel manager or admin.");
            setLoading(false);
        }
    };

    // Step 2: Fetch selected hotel's full data + room types
    const fetchHotelData = async () => {
        if (!selectedHotelId) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch hotel list with bookings/rooms
            const response = await axios.get(`${MY_HOTEL_URL}?date=${filterDate}`, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            const hotels = Array.isArray(response.data) ? response.data : [response.data];
            const selected = hotels.find(h => h.id === selectedHotelId) || hotels[0];
            setHotel(selected);
            setRooms(selected.rooms || []);
            setBookings(selected.upcoming_bookings || []);

            // Fetch room types for this hotel
            const rtRes = await axios.get(
                `${BASE_URL}hotels/room-types/?hotel_id=${selectedHotelId}`,
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setRoomTypes(rtRes.data);

        } catch (err) {
            setError("Error fetching hotel data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authTokens) fetchAllHotels();
        else { setLoading(false); setError("You must be logged in."); }
    }, [authTokens]);

    useEffect(() => {
        if (authTokens && selectedHotelId) fetchHotelData();
    }, [authTokens, selectedHotelId, refreshTrigger, filterDate]);

    if (loading) return <div style={styles.loading}>Loading Hotel Dashboard...</div>;
    if (error) return <div style={styles.errorContainer}>{error}</div>;
    if (!hotel) return <div style={styles.errorContainer}>No hotel data found.</div>;

    const isMultiHotel = allHotels.length > 1;
    const refresh = () => setRefreshTrigger(prev => prev + 1);

    return (
        <div style={styles.container}>

            {/* ✅ Hotel Selector — only for admin with multiple hotels */}
            {isMultiHotel && (
                <div style={styles.hotelSelectorBox}>
                    <label style={styles.hotelSelectorLabel}>🏨 Select Hotel to Manage:</label>
                    <div style={styles.hotelSelectorGrid}>
                        {allHotels.map((h) => (
                            <button
                                key={h.id}
                                onClick={() => setSelectedHotelId(h.id)}
                                style={{
                                    ...styles.hotelSelectorBtn,
                                    ...(selectedHotelId === h.id ? styles.hotelSelectorBtnActive : {})
                                }}
                            >
                                <span style={styles.hotelBtnName}>{h.name}</span>
                                <span style={styles.hotelBtnCity}>{h.city}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <h1 style={styles.mainHeader}>🏨 Dashboard for {hotel.name}</h1>
            <p style={styles.hotelInfo}>Location: {hotel.city}, {hotel.address}</p>

            {/* Analytics Cards */}
            <div style={styles.analyticsSection}>
                <h2 style={styles.analyticsSectionTitle}>📊 Analytics</h2>
                <div style={styles.analyticsGrid}>
                    <Link to="/analytics/revenue" style={styles.analyticsCard}>
                        <div style={styles.analyticsIcon}>💰</div>
                        <div>
                            <p style={styles.analyticsCardTitle}>Revenue Analysis</p>
                            <p style={styles.analyticsCardSub}>Total revenue, trends & room-wise breakdown</p>
                        </div>
                        <span style={styles.analyticsArrow}>→</span>
                    </Link>
                    <Link to="/analytics/occupancy" style={styles.analyticsCard}>
                        <div style={styles.analyticsIcon}>📈</div>
                        <div>
                            <p style={styles.analyticsCardTitle}>Occupancy Analysis</p>
                            <p style={styles.analyticsCardSub}>Room occupancy rates & booking trends</p>
                        </div>
                        <span style={styles.analyticsArrow}>→</span>
                    </Link>
                </div>
            </div>

            {/* ✅ Two separate forms side by side */}
            <div style={styles.contentGrid}>
                <div style={styles.section}>
                    <AddRoomTypeForm
                        hotelId={hotel.id}
                        authTokens={authTokens}
                        onAdded={refresh}
                    />
                </div>
                <div style={styles.section}>
                    <AddRoomForm
                        hotelId={hotel.id}
                        authTokens={authTokens}
                        roomTypes={roomTypes}
                        onAdded={refresh}
                    />
                </div>
            </div>

            {/* Existing Rooms */}
            <div style={{ ...styles.section, marginTop: '30px' }}>
                <h3 style={styles.sectionHeader}>Existing Rooms ({rooms.length})</h3>
                <div style={styles.roomGrid}>
                    {rooms.length === 0 ? <p>No rooms defined yet.</p> :
                        rooms.map((room) => (
                            <div key={room.id} style={styles.roomCard}>
                                <h4 style={styles.roomCardTitle}>Room {room.room_number}</h4>
                                <p style={styles.roomCardType}>{room.room_type_name || 'Unknown Type'}</p>
                                <p style={styles.roomCardDetail}>💰 ₹{parseFloat(room.price_per_night || 0).toFixed(2)}/night</p>
                                <p style={styles.roomCardDetail}>👥 Capacity: {room.capacity || '-'}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Bookings Table */}
            <div style={{ ...styles.section, marginTop: '30px' }}>
                <div style={styles.filterHeader}>
                    <h3 style={styles.sectionHeader}>📅 Guest Bookings</h3>
                    <div style={styles.filterControls}>
                        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filter from:</label>
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={styles.dateInput} />
                        <button onClick={() => setFilterDate(new Date().toISOString().split('T')[0])} style={styles.resetButton}>Today</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
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
                                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
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
    hotelSelectorBox: { marginBottom: '28px', padding: '20px', backgroundColor: '#f0f4ff', borderRadius: '10px', border: '1px solid #d0d9f0' },
    hotelSelectorLabel: { display: 'block', fontWeight: '700', color: '#003366', marginBottom: '12px', fontSize: '1rem' },
    hotelSelectorGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    hotelSelectorBtn: { padding: '10px 20px', borderRadius: '8px', border: '2px solid #003366', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '140px' },
    hotelSelectorBtnActive: { background: '#003366', color: 'white' },
    hotelBtnName: { fontWeight: '700', fontSize: '0.95rem' },
    hotelBtnCity: { fontSize: '0.78rem', opacity: 0.7, marginTop: '2px' },
    analyticsSection: { marginBottom: '30px' },
    analyticsSectionTitle: { color: '#003366', fontSize: '1.2rem', marginBottom: '12px' },
    analyticsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
    analyticsCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #003366 0%, #005599 100%)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,51,102,0.2)' },
    analyticsIcon: { fontSize: '2rem', flexShrink: 0 },
    analyticsCardTitle: { margin: '0 0 4px', fontWeight: '700', fontSize: '1rem' },
    analyticsCardSub: { margin: 0, fontSize: '0.8rem', opacity: 0.8 },
    analyticsArrow: { marginLeft: 'auto', fontSize: '1.3rem', opacity: 0.7 },
    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' },
    section: { padding: '20px', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fdfdfd' },
    sectionHeader: { color: '#ff6600', marginBottom: '10px' },
    roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '10px' },
    roomCard: { padding: '15px', borderLeft: '5px solid #003366', borderRadius: '6px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    roomCardTitle: { margin: '0 0 4px', color: '#003366', fontSize: '1rem' },
    roomCardType: { margin: '0 0 8px', color: '#ff6600', fontWeight: '600', textTransform: 'capitalize' },
    roomCardDetail: { margin: '2px 0', color: '#555', fontSize: '0.88rem' },
    filterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    filterControls: { display: 'flex', alignItems: 'center', gap: '10px' },
    dateInput: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' },
    resetButton: { padding: '8px 12px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    formHeader: { color: '#003366', fontSize: '1.2rem', margin: '0 0 4px' },
    input: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' },
    button: { padding: '12px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
    errorMessage: { color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', margin: 0 },
    successMessage: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px', margin: 0 },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: '#f4f4f4', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333' },
    td: { padding: '12px', borderBottom: '1px solid #eee', color: '#555' },
    tr: { transition: 'background 0.2s' },
};
