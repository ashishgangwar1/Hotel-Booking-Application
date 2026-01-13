// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const BASE_URL = 'api/';

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // --- State Initialization ---
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') 
            ? JSON.parse(localStorage.getItem('authTokens')) 
            : null
    );
    const [user, setUser] = useState(() => 
        localStorage.getItem('authTokens') 
            ? JSON.parse(localStorage.getItem('authTokens')).user 
            : null
    );
    
    // 1. FIXED: Define isManager state
    const [isManager, setIsManager] = useState(false);
    // Use a secondary loading state to prevent flickering during status checks
    const [loading, setLoading] = useState(true);

    // --- Function to check if the user is a manager ---
    const checkManagerStatus = async (tokens) => {
        if (!tokens) {
            setIsManager(false);
            return;
        }
        try {
            // Attempt to fetch the manager's hotel
            await axios.get(`${BASE_URL}hotels/my_hotel/`, {
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            setIsManager(true);
        } catch (error) {
            // If it fails (403 or 404), the user is not a manager
            setIsManager(false);
        }
    };

    // --- Check status on app load/refresh ---
    useEffect(() => {
        const initializeAuth = async () => {
            if (authTokens) {
                await checkManagerStatus(authTokens);
            }
            setLoading(false);
        };
        initializeAuth();
    }, [authTokens]);

    // --- Login Function ---
    const loginUser = async (username, password) => {
        try {
            const response = await axios.post(`${BASE_URL}token/`, {
                username,
                password
            });
            
            if (response.status === 200) {
                const data = response.data;
                data.user = username;

                setAuthTokens(data);
                setUser(username);
                localStorage.setItem('authTokens', JSON.stringify(data));
                
                // Check manager status immediately after login
                await checkManagerStatus(data);
                return true;
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data);
            return false; 
        }
    };

    // --- Logout Function ---
    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        setIsManager(false); // FIXED: Reset manager status on logout
        localStorage.removeItem('authTokens');
        navigate('/login');
    };
    
    // --- Registration Function ---
    const registerUser = async (username, email, password, password2) => {
        try {
            const response = await axios.post(`${BASE_URL}register/`, {
                username,
                email,
                password,
                password2
            });
            
            if (response.status === 201) {
                return { success: true, message: "Registration successful. Please login." };
            }
        } catch (error) {
            return { success: false, errors: error.response?.data };
        }
    };

    const contextData = {
        user,
        authTokens,
        isManager,
        loading,
        loginUser,
        logoutUser,
        registerUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {/* Only render the app once we've finished the initial 
               loading check for tokens and manager status.
            */}
            {!loading ? children : <div style={{textAlign:'center', padding:'50px'}}>Loading Application...</div>}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);