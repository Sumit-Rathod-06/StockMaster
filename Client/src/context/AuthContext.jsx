import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // If you have a validate endpoint, use it
                // For now, we'll just set the user from localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (loginId, password) => {
        try {
            const response = await api.post('/auth/login', { loginId, password });
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
            }
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    };

    const register = async (loginId, emailId, password, role = 'InventoryManager') => {
        try {
            const response = await api.post('/auth/register', { 
                loginId, 
                emailId, 
                password,
                role 
            });
            if (response.data.success) {
                // Note: Register endpoint doesn't return token, only user data
                // User needs to login separately
                return response.data;
            }
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
