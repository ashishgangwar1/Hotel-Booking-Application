import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
    BarChart, Bar, LineChart, Line, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BASE_URL = "http://127.0.0.1:8000/api/";
const COLORS = ["#003366", "#ff6600", "#28a745", "#ffc107", "#17a2b8", "#6f42c1"];

const StatCard = ({ label, value, sub, accent }) => (
    <div style={{ ...s.statCard, borderTop: `4px solid ${accent || "#ff6600"}` }}>
        <p style={s.statLabel}>{label}</p>
        <p style={s.statValue}>{value}</p>
        {sub && <p style={s.statSub}>{sub}</p>}
    </div>
);

const OccupancyBar = ({ hotel, total_rooms, occupied_rooms, occupancy_rate }) => {
    const pct = occupancy_rate;
    const color = pct >= 75 ? "#28a745" : pct >= 40 ? "#ffc107" : "#dc3545";
    return (
        <div style={s.occRow}>
            <div style={s.occMeta}>
                <span style={s.occHotel}>{hotel}</span>
                <span style={{ ...s.occBadge, background: color }}>{pct}%</span>
            </div>
            <div style={s.occTrack}>
                <div style={{ ...s.occFill, width: `${pct}%`, background: color }} />
            </div>
            <p style={s.occDetail}>{occupied_rooms} of {total_rooms} rooms occupied today</p>
        </div>
    );
};

function OccupancyPage() {
    const { authTokens } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authTokens) return;
        (async () => {
            try {
                const res = await axios.get(
                    `${BASE_URL}hotels/analytics/occupancy/`,
                    { headers: { Authorization: `Bearer ${authTokens.access}` } }
                );
                setData(res.data);
            } catch (err) {
                setError(
                    err.response?.status === 403
                        ? "Access denied. Manager or Admin role required."
                        : "Failed to load occupancy data."
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [authTokens]);

    if (loading) return <div style={s.center}>Loading Occupancy Analytics...</div>;
    if (error) return <div style={s.errorBox}>{error}</div>;
    if (!data) return null;

    const { summary, occupancy_per_hotel, occupancy_trend, room_occupancy_breakdown } = data;

    return (
        <div style={s.page}>
            <div style={s.header}>
                <div>
                    <Link to="/hotel-dashboard" style={s.backLink}>← Back to Dashboard</Link>
                    <h1 style={s.title}>📊 Occupancy Analysis</h1>
                    <p style={s.subtitle}>Real-time room occupancy across your properties</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={s.statsRow}>
                <StatCard label="Total Rooms" value={summary.total_rooms} sub="Across all hotels" accent="#003366" />
                <StatCard label="Currently Occupied" value={summary.currently_occupied} sub="Active check-ins today" accent="#ff6600" />
                <StatCard
                    label="Overall Occupancy"
                    value={`${summary.overall_occupancy_rate}%`}
                    sub={summary.overall_occupancy_rate >= 75 ? "🟢 High" : summary.overall_occupancy_rate >= 40 ? "🟡 Moderate" : "🔴 Low"}
                    accent={summary.overall_occupancy_rate >= 75 ? "#28a745" : summary.overall_occupancy_rate >= 40 ? "#ffc107" : "#dc3545"}
                />
            </div>

            {/* Per Hotel Occupancy */}
            <div style={s.card}>
                <h2 style={s.cardTitle}>🏨 Occupancy Rate per Hotel (Today)</h2>
                {occupancy_per_hotel.length === 0 ? (
                    <p style={s.empty}>No hotel data available.</p>
                ) : (
                    occupancy_per_hotel.map((h, i) => <OccupancyBar key={i} {...h} />)
                )}
            </div>

            {/* Occupancy Trend */}
            <div style={s.card}>
                <h2 style={s.cardTitle}>📅 Booking Trend (Last 6 Months)</h2>
                {occupancy_trend.length === 0 ? (
                    <p style={s.empty}>No trend data available yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={occupancy_trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip formatter={(v) => [v, "Bookings"]} />
                            <Line type="monotone" dataKey="bookings" stroke="#ff6600" strokeWidth={3} dot={{ fill: "#003366", r: 5 }} activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Room Type Breakdown */}
            <div style={s.card}>
                <h2 style={s.cardTitle}>🛏️ Room-wise Occupancy Breakdown (Today)</h2>
                {room_occupancy_breakdown.length === 0 ? (
                    <p style={s.empty}>No rooms are currently occupied.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={room_occupancy_breakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="room_type" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip formatter={(v) => [v, "Occupied Rooms"]} labelFormatter={(l) => `Room Type: ${l}`} />
                            <Bar dataKey="occupied" radius={[6, 6, 0, 0]}>
                                {room_occupancy_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default OccupancyPage;

const s = {
    page: { maxWidth: "1100px", margin: "40px auto", padding: "0 20px 60px" },
    header: { marginBottom: "32px" },
    backLink: { color: "#ff6600", textDecoration: "none", fontSize: "0.9rem", display: "block", marginBottom: "8px" },
    title: { color: "#003366", margin: 0, fontSize: "1.8rem" },
    subtitle: { color: "#888", margin: "4px 0 0", fontSize: "0.95rem" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
    statCard: { background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
    statLabel: { margin: "0 0 8px", color: "#888", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" },
    statValue: { margin: "0 0 4px", color: "#003366", fontSize: "1.7rem", fontWeight: "800" },
    statSub: { margin: 0, color: "#aaa", fontSize: "0.8rem" },
    card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: "24px" },
    cardTitle: { color: "#003366", margin: "0 0 20px", fontSize: "1.1rem" },
    empty: { color: "#aaa", textAlign: "center", padding: "40px 0" },
    occRow: { marginBottom: "20px" },
    occMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
    occHotel: { fontWeight: "600", color: "#333", fontSize: "0.95rem" },
    occBadge: { color: "white", fontSize: "0.8rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
    occTrack: { background: "#f0f0f0", borderRadius: "6px", height: "12px", overflow: "hidden" },
    occFill: { height: "100%", borderRadius: "6px", transition: "width 0.6s ease" },
    occDetail: { margin: "4px 0 0", color: "#999", fontSize: "0.8rem" },
    center: { textAlign: "center", padding: "100px", color: "#003366", fontSize: "1.1rem" },
    errorBox: { maxWidth: "500px", margin: "60px auto", padding: "24px", background: "#f8d7da", color: "#721c24", borderRadius: "10px", textAlign: "center" },
};
