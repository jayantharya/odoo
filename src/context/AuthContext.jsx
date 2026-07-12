import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Mocking an authenticated Fleet Manager for the hackathon boilerplate
    const [user, setUser] = useState({
        name: 'Admin User',
        role: 'Fleet Manager'
    });

    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);