import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000/api/";

function FavoritesPage() {
    const { authTokens } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`${BASE_URL}accounts/favorites/`, {
                headers: { Authorization: `Bearer ${authTokens.access}` },
            });
            setFavorites(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromFavorites = async (hotelId) => {
        try {
            await axios.delete(
                `${BASE_URL}accounts/favorites/${hotelId}/`,
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setFavorites((prev) =>
                prev.filter((item) => item.hotel.id !== hotelId)
            );
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (authTokens) fetchFavorites();
    }, [authTokens]);

    if (loading) return <div style={styles.loading}>Loading Favorites...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>⭐ My Favorites</h1>

            {favorites.length === 0 ? (
                <div style={styles.empty}>
                    <p>You have no favorite hotels yet.</p>
                    <Link to="/" style={styles.link}>
                        Explore Hotels
                    </Link>
                </div>
            ) : (
                <div style={styles.grid}>
                    {favorites.map((item) => (
                        <div key={item.id} style={styles.card}>
                            <h3 style={styles.hotelName}>{item.hotel.name}</h3>
                            <p>📍 {item.hotel.city}</p>
                            <p>⭐ Rating: {item.hotel.rating}</p>
                            <p style={styles.date}>
                                Added: {new Date(item.added_at).toLocaleDateString()}
                            </p>
                            <div style={styles.buttons}>
                                <Link
                                    to={`/hotel/${item.hotel.id}`}
                                    style={styles.viewBtn}
                                >
                                    View Hotel
                                </Link>
                                <button
                                    style={styles.removeBtn}
                                    onClick={() =>
                                        removeFromFavorites(item.hotel.id)
                                    }
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;

const styles = {
    container: { maxWidth: "1000px", margin: "40px auto", padding: "20px" },
    heading: { color: "#003366", marginBottom: "30px" },
    loading: { textAlign: "center", padding: "50px" },
    empty: { textAlign: "center", padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" },
    link: { color: "#ff6600", fontWeight: "bold", textDecoration: "none" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
    card: { border: "1px solid #ddd", borderRadius: "10px", padding: "20px", backgroundColor: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
    hotelName: { color: "#003366", marginTop: 0 },
    date: { fontSize: "0.8em", color: "#888" },
    buttons: { display: "flex", gap: "10px", marginTop: "15px" },
    viewBtn: { backgroundColor: "#003366", color: "white", padding: "8px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "0.9em" },
    removeBtn: { backgroundColor: "#dc3545", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "0.9em" },
};