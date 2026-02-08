import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    }
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common['Authorization'];
  };

  return (
    <div>
      {!token ? (
        <Login onLogin={handleLogin} API={API} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} API={API} />
      )}
    </div>
  );
}

export { API };
export default App;