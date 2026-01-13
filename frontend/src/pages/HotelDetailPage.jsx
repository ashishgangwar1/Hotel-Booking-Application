// frontend/src/pages/HotelDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function HotelDetailPage() {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);

    const BASE_URL = ''; // Django server base

    useEffect(() => {
        axios.get(`${BASE_URL}/api/hotels/${id}/`)
            .then(res => {
                setHotel(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={styles.center}>Loading Hotel Details...</div>;
    if (!hotel) return <div style={styles.center}>Hotel not found.</div>;

    // Handle Image URL: Check if it's a full URL or needs the base prefix
    const imageUrl = hotel.main_image 
        ? (hotel.main_image.startsWith('http') ? hotel.main_image : `${BASE_URL}${hotel.main_image}`)
        : "https://via.placeholder.com/800x400?text=No+Image+Available";

    return (
        <div style={styles.container}>
            {/* 1. Hotel Header Image */}
            <div style={styles.imageContainer}>
                <img src={imageUrl} alt={hotel.name} style={styles.headerImage} />
            </div>

            {/* 2. Hotel Basic Info */}
            <div style={styles.infoSection}>
                <h1 style={styles.title}>{hotel.name}</h1>
                <p style={styles.address}>
                    <span style={styles.icon}>📍</span> {hotel.address}, {hotel.city}
                </p>
                <div style={styles.descriptionCard}>
                    <h3 style={styles.subTitle}>About this hotel</h3>
                    <p style={styles.description}>{hotel.description}</p>
                </div>
            </div>

            <hr style={styles.divider} />

            {/* 3. Room List Section */}
            <h2 style={styles.subTitle}>Select Your Room</h2>
            <div style={styles.roomGrid}>
                {hotel.rooms && hotel.rooms.length > 0 ? (
                    hotel.rooms.map(room => (
                        <div key={room.id} style={styles.roomCard}>
                            <div style={styles.roomBadge}>{room.room_type}</div>
                            <div style={styles.roomInfo}>
                                <p><strong>Max Guests:</strong> {room.max_guests} People</p>
                                <p><strong>Price:</strong> <span style={styles.price}>₹{room.price_per_night}</span> / night</p>
                            </div>
                            <Link to={`/booking/${room.id}`} style={styles.bookBtn}>
                                Book Now
                            </Link>
                        </div>
                    ))
                ) : (
                    <p style={styles.noRooms}>No specific rooms listed for this hotel yet.</p>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '30px auto', fontFamily: 'Arial, sans-serif' },
    center: { textAlign: 'center', padding: '50px' },
    imageContainer: { width: '100%', height: '400px', overflow: 'hidden', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    headerImage: { width: '100%', height: '100%', objectFit: 'cover' },
    infoSection: { marginBottom: '30px' },
    title: { color: '#003366', fontSize: '2.5rem', marginBottom: '10px' },
    address: { fontSize: '1.1rem', color: '#555', display: 'flex', alignItems: 'center', marginBottom: '20px' },
    icon: { marginRight: '8px', fontSize: '1.3rem' },
    descriptionCard: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #003366' },
    subTitle: { color: '#003366', marginBottom: '15px' },
    description: { lineHeight: '1.7', color: '#444' },
    divider: { margin: '40px 0', border: '0', borderTop: '1px solid #eee' },
    roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
    roomCard: { border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    roomBadge: { backgroundColor: '#003366', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' },
    roomInfo: { padding: '20px' },
    price: { color: '#e67e22', fontSize: '1.4rem', fontWeight: 'bold' },
    bookBtn: { display: 'block', backgroundColor: '#e67e22', color: 'white', textAlign: 'center', padding: '12px', textDecoration: 'none', fontWeight: 'bold', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' },
    noRooms: { fontStyle: 'italic', color: '#888' }
};

export default HotelDetailPage;