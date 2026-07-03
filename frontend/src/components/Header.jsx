import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { user, logoutUser, isManager } = useAuth();

    return (
        <header style={styles.header}>
            <div style={styles.logo}>
                <Link to="/" style={styles.logoLink}>
                    🏨 Hotel Bookings
                </Link>
            </div>

            <nav style={styles.nav}>
                <ul style={styles.navList}>

                    {/* Public Link */}
                    <li style={styles.navItem}>
                        <Link to="/" style={styles.navLink}>Home</Link>
                    </li>

                    {user ? (
                        <>
                            {/* ✅ My Bookings */}
                            <li style={styles.navItem}>
                                <Link to="/my-bookings" style={styles.navLink}>
                                    📋 My Bookings
                                </Link>
                            </li>

                            {/* ✅ Wishlist */}
                            <li style={styles.navItem}>
                                <Link to="/wishlist" style={styles.navLink}>
                                    ❤️ Wishlist
                                </Link>
                            </li>

                            {/* ✅ Favorites */}
                            <li style={styles.navItem}>
                                <Link to="/favorites" style={styles.navLink}>
                                    ⭐ Favorites
                                </Link>
                            </li>

                            {/* Manager only link */}
                            {isManager && (
                                <li style={styles.navItem}>
                                    <Link to="/manager-bookings" style={styles.navLink}>
                                        🏢 Manager
                                    </Link>
                                </li>
                            )}

                            {/* Dashboard */}
                            <li style={styles.navItem}>
                                <Link to="/dashboard" style={styles.navLink}>
                                    Dashboard
                                </Link>
                            </li>

                            {/* Username */}
                            <li style={styles.username}>
                                Hello, {user}!
                            </li>

                            {/* Logout */}
                            <li style={styles.navItem}>
                                <button
                                    onClick={logoutUser}
                                    style={styles.logoutButton}
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li style={styles.navItem}>
                                <Link to="/login" style={styles.navLink}>
                                    Login
                                </Link>
                            </li>
                            <li style={styles.navItem}>
                                <Link to="/register" style={styles.navButton}>
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;

const styles = {
    header: {
        backgroundColor: '#003366',
        color: 'white',
        padding: '10px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    logo: { fontSize: '1.5em', fontWeight: 'bold' },
    logoLink: { color: 'white', textDecoration: 'none' },
    nav: {},
    navList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    navItem: { display: 'inline' },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        padding: '5px 10px',
        transition: 'color 0.2s',
    },
    navButton: {
        backgroundColor: '#ffc107',
        color: '#333',
        padding: '8px 15px',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        color: 'white',
        border: '1px solid white',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    username: {
        color: '#ffc107',
        fontWeight: 'bold',
        display: 'inline',
    },
};