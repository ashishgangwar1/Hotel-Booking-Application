import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000/api/';

function HotelCard({ hotel }) {
    const { authTokens, user } = useAuth();
    const [wishlisted, setWishlisted] = useState(false);
    const [favorited, setFavorited] = useState(false);

    const formatPrice = (price) => {
        if (price === null || price === undefined) return 'Price N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(price);
    };

    const minPrice = hotel.rooms && hotel.rooms.length > 0
        ? Math.min(...hotel.rooms.map(room => parseFloat(room.price_per_night)))
        : null;

    const toggleWishlist = async () => {
        if (!user) return alert("Please login to use wishlist!");

         // ✅ Add this debug line
    console.log("Token being sent:", authTokens?.access);
    
        try {
            if (wishlisted) {
                await axios.delete(
                    `${BASE_URL}accounts/wishlist/${hotel.id}/`,
                    { headers: { Authorization: `Bearer ${authTokens.access}` } }
                );
                setWishlisted(false);
            } else {
                await axios.post(
                    `${BASE_URL}accounts/wishlist/`,
                    { hotel_id: hotel.id },
                    { headers: { Authorization: `Bearer ${authTokens.access}` } }
                );
                setWishlisted(true);
            }
        } catch (err) {
            console.error("Wishlist error:", err);
        }
    };

    const toggleFavorite = async () => {
        if (!user) return alert("Please login to use favorites!");
        try {
            if (favorited) {
                await axios.delete(
                    `${BASE_URL}accounts/favorites/${hotel.id}/`,
                    { headers: { Authorization: `Bearer ${authTokens.access}` } }
                );
                setFavorited(false);
            } else {
                await axios.post(
                    `${BASE_URL}accounts/favorites/`,
                    { hotel_id: hotel.id },
                    { headers: { Authorization: `Bearer ${authTokens.access}` } }
                );
                setFavorited(true);
            }
        } catch (err) {
            console.error("Favorite error:", err);
        }
    };

    return (
        <div style={styles.card}>
            {/* Hotel Image */}
            <div style={styles.imageContainer}>
                {hotel.images && hotel.images.length > 0 ? (
                    <img
                        src={`http://127.0.0.1:8000${hotel.images[0].image}`}
                        alt={`Image of ${hotel.name}`}
                        style={styles.image}
                    />
                ) : (
                    <div style={styles.imagePlaceholder}>
                        <p>No Image Available</p>
                    </div>
                )}

                {/* ✅ Wishlist & Favorite buttons on top of image */}
                {user && (
                    <div style={styles.actionButtons}>
                        <button
                            onClick={toggleWishlist}
                            style={styles.iconBtn}
                            title="Add to Wishlist"
                        >
                            {wishlisted ? '❤️' : '🤍'}
                        </button>
                        <button
                            onClick={toggleFavorite}
                            style={styles.iconBtn}
                            title="Add to Favorites"
                        >
                            {favorited ? '⭐' : '☆'}
                        </button>
                    </div>
                )}
            </div>

            {/* Hotel Content */}
            <div style={styles.content}>
                <h3 style={styles.hotelName}>{hotel.name}</h3>
                <p style={styles.location}>📍 {hotel.city}, {hotel.address}</p>
                <p style={styles.description}>
                    {hotel.description.substring(0, 100)}...
                </p>

                <div style={styles.footer}>
                    {minPrice ? (
                        <p style={styles.price}>
                            From {formatPrice(minPrice)} / night
                        </p>
                    ) : (
                        <p style={styles.price}>No rooms available</p>
                    )}
                    <Link to={`/hotel/${hotel.id}`} style={styles.button}>
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HotelCard;

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    imageContainer: {
        height: '200px',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',  // ✅ needed for absolute buttons
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    imagePlaceholder: {
        height: '200px',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ✅ Wishlist & Favorite buttons
    actionButtons: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        gap: '8px',
    },
    iconBtn: {
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        fontSize: '1.1em',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: '15px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    hotelName: { margin: '0 0 5px 0', color: '#003366', fontSize: '1.5em' },
    location: { margin: '0 0 10px 0', fontSize: '0.9em', color: '#777' },
    description: { fontSize: '0.9em', color: '#555', flexGrow: 1, marginBottom: '15px' },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #eee',
        paddingTop: '10px',
    },
    price: { fontSize: '1.2em', fontWeight: 'bold', color: '#28a745', margin: 0 },
    button: {
        backgroundColor: '#ff6600',
        color: 'white',
        padding: '8px 15px',
        textAlign: 'center',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};