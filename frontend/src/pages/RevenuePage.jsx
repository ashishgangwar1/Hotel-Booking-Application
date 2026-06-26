import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BASE_URL = "http://127.0.0.1:8000/api/";
const COLORS = ["#003366", "#ff6600", "#28a745", "#ffc107", "#17a2b8", "#6f42c1"];

const StatCard = ({ label, value, sub }) => (
    <div style={s.statCard}>
        <p style={s.statLabel}>{label}</p>
        <p style={s.statValue}>{value}</p>
        {sub && <p style={s.statSub}>{sub}</p>}
    </div>
);

function RevenuePage() {
    const { authTokens } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState("monthly");

    const fetchRevenue = async (p) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `${BASE_URL}hotels/analytics/revenue/?period=${p}`,
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setData(res.data);
        } catch (err) {
            setError(
                err.response?.status === 403
                    ? "Access denied. Manager or Admin role required."
                    : "Failed to load revenue data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authTokens) fetchRevenue(period);
    }, [authTokens, period]);

    if (loading) return <div style={s.center}>Loading Revenue Analytics...</div>;
    if (error) return <div style={s.errorBox}>{error}</div>;
    if (!data) return null;

    const { summary, revenue_over_time, revenue_per_hotel, revenue_per_room_type } = data;

    return (
        <div style={s.page}>
            <div style={s.header}>
                <div>
                    <Link to="/hotel-dashboard" style={s.backLink}>← Back to Dashboard</Link>
                    <h1 style={s.title}>💰 Revenue Analysis</h1>
                    <p style={s.subtitle}>Track your earnings across hotels and room types</p>
                </div>
                <div style={s.periodToggle}>
                    <button style={period === "monthly" ? s.toggleActive : s.toggleBtn} onClick={() => setPeriod("monthly")}>Monthly</button>
                    <button style={period === "weekly" ? s.toggleActive : s.toggleBtn} onClick={() => setPeriod("weekly")}>Weekly</button>
                </div>
            </div>

            <div style={s.statsRow}>
                <StatCard label="Total Revenue" value={`₹${summary.total_revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} sub="Confirmed & completed bookings" />
                <StatCard label="Total Bookings" value={summary.total_bookings} sub="Confirmed & completed" />
                <StatCard label="Avg Booking Value" value={`₹${summary.avg_booking_value.toLocaleString("en-IN")}`} sub="Per booking" />
            </div>

            <div style={s.card}>
                <h2 style={s.cardTitle}>📈 Revenue Over Time ({period === "monthly" ? "Last 6 Months" : "Weekly Breakdown"})</h2>
                {revenue_over_time.length === 0 ? (
                    <p style={s.empty}>No revenue data available yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenue_over_time}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                            <Line type="monotone" dataKey="revenue" stroke="#003366" strokeWidth={3} dot={{ fill: "#ff6600", r: 5 }} activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div style={s.twoCol}>
                <div style={s.card}>
                    <h2 style={s.cardTitle}>🏨 Revenue by Hotel</h2>
                    {revenue_per_hotel.length === 0 ? <p style={s.empty}>No data available.</p> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={revenue_per_hotel} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="hotel" tick={{ fontSize: 11 }} width={110} />
                                <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                                    {revenue_per_hotel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={s.card}>
                    <h2 style={s.cardTitle}>🛏️ Revenue by Room Type</h2>
                    {revenue_per_room_type.length === 0 ? <p style={s.empty}>No data available.</p> : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={revenue_per_room_type} dataKey="revenue" nameKey="room_type" cx="50%" cy="50%" outerRadius={80} label={({ room_type, percent }) => `${room_type} ${(percent * 100).toFixed(0)}%`}>
                                        {revenue_per_room_type.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <table style={s.legendTable}>
                                <tbody>
                                    {revenue_per_room_type.map((item, i) => (
                                        <tr key={i}>
                                            <td><span style={{ ...s.dot, background: COLORS[i % COLORS.length] }} /></td>
                                            <td style={s.legendLabel}>{item.room_type}</td>
                                            <td style={s.legendValue}>₹{item.revenue.toLocaleString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RevenuePage;

const s = {
    page: { maxWidth: "1100px", margin: "40px auto", padding: "0 20px 60px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "32px" },
    backLink: { color: "#ff6600", textDecoration: "none", fontSize: "0.9rem", display: "block", marginBottom: "8px" },
    title: { color: "#003366", margin: 0, fontSize: "1.8rem" },
    subtitle: { color: "#888", margin: "4px 0 0", fontSize: "0.95rem" },
    periodToggle: { display: "flex", gap: "8px", alignSelf: "flex-end" },
    toggleBtn: { padding: "8px 18px", border: "2px solid #003366", borderRadius: "6px", background: "white", color: "#003366", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
    toggleActive: { padding: "8px 18px", border: "2px solid #003366", borderRadius: "6px", background: "#003366", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
    statCard: { background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderTop: "4px solid #ff6600" },
    statLabel: { margin: "0 0 8px", color: "#888", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" },
    statValue: { margin: "0 0 4px", color: "#003366", fontSize: "1.7rem", fontWeight: "800" },
    statSub: { margin: 0, color: "#aaa", fontSize: "0.8rem" },
    card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: "24px" },
    cardTitle: { color: "#003366", margin: "0 0 20px", fontSize: "1.1rem" },
    twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" },
    empty: { color: "#aaa", textAlign: "center", padding: "40px 0" },
    legendTable: { width: "100%", marginTop: "12px", borderCollapse: "collapse" },
    legendLabel: { padding: "4px 8px", color: "#555", fontSize: "0.9rem" },
    legendValue: { padding: "4px 8px", color: "#003366", fontWeight: "700", textAlign: "right", fontSize: "0.9rem" },
    dot: { display: "inline-block", width: "10px", height: "10px", borderRadius: "50%" },
    center: { textAlign: "center", padding: "100px", color: "#003366", fontSize: "1.1rem" },
    errorBox: { maxWidth: "500px", margin: "60px auto", padding: "24px", background: "#f8d7da", color: "#721c24", borderRadius: "10px", textAlign: "center" },
};
