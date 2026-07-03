import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://127.0.0.1:8000/api";

function ManagerBookingsPage() {
    const { authTokens } = useAuth();

    console.log("authTokens =", authTokens);
console.log("access =", authTokens?.access);


    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
       
        try {
            const response = await axios.get(
                `${BASE_URL}/bookings/manager/`,
                {
                    headers: {
                        Authorization: `Bearer ${authTokens.access}`,
                    },
                }
            );

            setBookings(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    if (authTokens) {
        fetchBookings();
    }
}, [authTokens]);

    const approveBooking = async (id) => {
        try {
            await axios.post(
                `${BASE_URL}/bookings/manager/${id}/approve/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authTokens.access}`,
                    },
                }
            );

            fetchBookings();
        } catch (err) {
            console.error(err);
        }
    };

    const rejectBooking = async (id) => {
        try {
            await axios.post(
                `${BASE_URL}/bookings/manager/${id}/reject/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authTokens.access}`,
                    },
                }
            );

            fetchBookings();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <h2>Loading Bookings...</h2>;

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Manager Dashboard</h1>

            {bookings.map((booking) => (
                <div key={booking.id} style={styles.card}>
                    <h3>
                        Booking #{booking.booking_reference}
                    </h3>

                    <p>
                        <strong>Room:</strong> {booking.room}
                    </p>

                    <p>
                        <strong>Check In:</strong> {booking.check_in}
                    </p>

                    <p>
                        <strong>Check Out:</strong> {booking.check_out}
                    </p>

                    <p>
                        <strong>Guests:</strong> {booking.guests}
                    </p>

                    <p>
                        <strong>Total:</strong> ₹{booking.total_amount}
                    </p>

                    <span
                        style={{
                            ...styles.status,
                            backgroundColor:
                                booking.status === "PENDING"
                                    ? "#ffc107"
                                    : booking.status === "CONFIRMED"
                                    ? "#28a745"
                                    : "#dc3545",
                        }}
                    >
                        {booking.status}
                    </span>

                    {booking.status === "PENDING" && (
                        <div style={styles.buttonContainer}>
                            <button
                                style={styles.approveBtn}
                                onClick={() =>
                                    approveBooking(booking.id)
                                }
                            >
                                Approve
                            </button>

                            <button
                                style={styles.rejectBtn}
                                onClick={() =>
                                    rejectBooking(booking.id)
                                }
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ManagerBookingsPage;

const styles = {
    container: {
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px",
    },

    heading: {
        color: "#003366",
        marginBottom: "30px",
    },

    card: {
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },

    status: {
        display: "inline-block",
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold",
        marginTop: "10px",
    },

    buttonContainer: {
        marginTop: "20px",
        display: "flex",
        gap: "10px",
    },

    approveBtn: {
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        padding: "10px 18px",
        borderRadius: "6px",
        cursor: "pointer",
    },

    rejectBtn: {
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        padding: "10px 18px",
        borderRadius: "6px",
        cursor: "pointer",
    },
};