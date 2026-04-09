import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await api.get('/api/auth/me');
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, deviceFingerprint = null) => {
        const { data } = await api.post('/api/auth/login', { email, password, deviceFingerprint });
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        return await api.post('/api/auth/register', userData);
    };

    const verifyOTP = async (email, otp) => {
        return await api.post('/api/auth/verify-otp', { email, otp });
    };

    const resendOTP = async (email) => {
        return await api.post('/api/auth/resend-otp', { email });
    };

    const logout = async () => {
        try {
            await api.post('/api/auth');
        } catch (e) {
            console.error("Logout failed", e);
        }
        localStorage.removeItem('bypass_role');
        setUser(null);
    };

    // DEBUG: Bypass Login for Network Issues
    const bypassLogin = (role) => {
        localStorage.setItem('bypass_role', role);
        const mockUser = {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'bypass@neurox.net',
            role: role,
            name: 'Bypass User'
        };
        setUser(mockUser);
        return mockUser;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOTP, resendOTP, logout, loading, checkAuth, bypassLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
