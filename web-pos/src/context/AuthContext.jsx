import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, setAccessToken, setProfile, getProfile } from '../store/profile.store';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setInternalToken] = useState(getAccessToken());
    const [user, setUser] = useState(getProfile());

    useEffect(() => {
        const storedToken = getAccessToken();
        const storedProfile = getProfile();
        if (storedToken) {
            setInternalToken(storedToken);
        }
        if (storedProfile) {
            setUser(storedProfile);
        }
    }, []);

    const setAuthToken = (newToken) => {
        setAccessToken(newToken);
        setInternalToken(newToken);
    };

    const setAuthUser = (newUser) => {
        setProfile(newUser);
        setUser(newUser);
    };

    const logout = () => {
        setAccessToken(null);
        setProfile(null);
        setInternalToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, setToken: setAuthToken, user, setUser: setAuthUser, isAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}; 