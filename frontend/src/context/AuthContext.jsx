import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const BASE_URL = 'http://127.0.0.1:8000/api/';

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [authTokens, setAuthTokens] = useState(() => {
        const stored = localStorage.getItem('authTokens');
        return stored ? JSON.parse(stored) : null;
    });

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('authTokens');
        return stored ? JSON.parse(stored).user : null;
    });

    const [isManager, setIsManager] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);

    // ✅ Refresh the access token using the refresh token
    const refreshAccessToken = useCallback(async () => {
        const stored = localStorage.getItem('authTokens');
        if (!stored) return null;

        const tokens = JSON.parse(stored);
        if (!tokens?.refresh) return null;

        try {
            const response = await axios.post(`${BASE_URL}token/refresh/`, {
                refresh: tokens.refresh,
            });

            const newTokens = {
                ...tokens,
                access: response.data.access,
            };

            localStorage.setItem('authTokens', JSON.stringify(newTokens));
            setAuthTokens(newTokens);
            return newTokens;
        } catch (error) {
            // Refresh token also expired — force logout
            console.warn("Refresh token expired. Logging out.");
            logoutUser();
            return null;
        }
    }, []);

    // ✅ Axios interceptor — auto-refresh on any 401 response
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response, // pass through success
            async (error) => {
                const originalRequest = error.config;

                // If 401 and we haven't retried yet
                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry
                ) {
                    originalRequest._retry = true;
                    const newTokens = await refreshAccessToken();

                    if (newTokens) {
                        // Retry original request with new access token
                        originalRequest.headers['Authorization'] =
                            `Bearer ${newTokens.access}`;
                        return axios(originalRequest);
                    }
                }

                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => axios.interceptors.response.eject(interceptor);
    }, [refreshAccessToken]);

    const checkManagerStatus = async (tokens) => {
        if (!tokens) { setIsManager(false); return; }
        try {
            await axios.get(`${BASE_URL}hotels/my-hotels/`, {
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            setIsManager(true);
        } catch (error) {
            setIsManager(false);
        }
    };

    // ✅ On app mount: try to refresh token silently, then check manager status
    useEffect(() => {
        const initializeAuth = async () => {
            if (authTokens) {
                // Try to get a fresh access token on page load
                const freshTokens = await refreshAccessToken();
                await checkManagerStatus(freshTokens || authTokens);
            }
            setAuthLoading(false);
        };
        initializeAuth();
    }, []);

    const loginUser = async (username, password) => {
        setLoginLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}token/`, {
                username,
                password,
            });

            if (response.status === 200) {
                const data = response.data;
                data.user = username;

                localStorage.setItem('authTokens', JSON.stringify(data));
                setAuthTokens(data);
                setUser(username);
                await checkManagerStatus(data);
                return true;
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data);
            return false;
        } finally {
            setLoginLoading(false);
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        setIsManager(false);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    const registerUser = async (username, email, password, password2) => {
        try {
            const response = await axios.post(`${BASE_URL}accounts/register/`, {
                username,
                email,
                password,
                password2,
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
        loading: loginLoading,
        authLoading,
        loginUser,
        logoutUser,
        registerUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {!authLoading
                ? children
                : <div style={{ textAlign: 'center', padding: '50px' }}>Loading Application...</div>
            }
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
