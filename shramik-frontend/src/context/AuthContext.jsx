import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('shramik_token') || null);
  const [email, setEmail] = useState(localStorage.getItem('shramik_user_email') || null);
  const [role, setRole] = useState(localStorage.getItem('shramik_user_role') || null);
  const [userId, setUserId] = useState(localStorage.getItem('shramik_user_id') || null);
  
  const [userProfile, setUserProfile] = useState(null);
  const [techProfile, setTechProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsCoordinates, setGpsCoordinates] = useState(null); // { lat, lng }

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
    detectLocation();
  }, [token]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setGpsCoordinates(coords);
          console.log("GPS Location detected:", coords);
        },
        (error) => {
          console.warn("Location permission denied or failed:", error.message);
          // Witty fallback coordinate (e.g. Bangalore center / Tech hub)
          setGpsCoordinates({ lat: 12.9716, lng: 77.5946 }); 
        }
      );
    } else {
      // Witty fallback coordinate
      setGpsCoordinates({ lat: 12.9716, lng: 77.5946 });
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/technicians/profile');
      setUserProfile(res.data.user);
      if (res.data.technician) {
        setTechProfile(res.data.technician);
      }
    } catch (err) {
      console.error("Failed to load profile details", err);
    } finally {
      setLoading(false);
    }
  };

  const login = (jwtResponse) => {
    localStorage.setItem('shramik_token', jwtResponse.token);
    localStorage.setItem('shramik_user_email', jwtResponse.email);
    localStorage.setItem('shramik_user_role', jwtResponse.role);
    localStorage.setItem('shramik_user_id', jwtResponse.userId);
    
    setToken(jwtResponse.token);
    setEmail(jwtResponse.email);
    setRole(jwtResponse.role);
    setUserId(jwtResponse.userId);
  };

  const logout = () => {
    localStorage.removeItem('shramik_token');
    localStorage.removeItem('shramik_user_email');
    localStorage.removeItem('shramik_user_role');
    localStorage.removeItem('shramik_user_id');
    
    setToken(null);
    setEmail(null);
    setRole(null);
    setUserId(null);
    setUserProfile(null);
    setTechProfile(null);
  };

  const updateProfileOnServer = async (name, phone, lat, lng) => {
    try {
      const payload = { name, phone };
      if (lat !== undefined && lng !== undefined) {
        payload.latitude = lat;
        payload.longitude = lng;
      } else if (gpsCoordinates) {
        payload.latitude = gpsCoordinates.lat;
        payload.longitude = gpsCoordinates.lng;
      }
      
      const res = await api.put('/api/technicians/profile', payload);
      setUserProfile(res.data);
      await fetchProfile(); // reload fully
      return res.data;
    } catch (err) {
      console.error("Failed to update profile", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      email,
      role,
      userId,
      userProfile,
      techProfile,
      gpsCoordinates,
      setGpsCoordinates,
      loading,
      login,
      logout,
      fetchProfile,
      updateProfile: updateProfileOnServer,
      detectLocation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
