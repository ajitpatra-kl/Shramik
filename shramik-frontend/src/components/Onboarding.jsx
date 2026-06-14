import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, CheckCircle, RefreshCw } from 'lucide-react';

const Onboarding = () => {
  const { updateProfile, gpsCoordinates, setGpsCoordinates } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [latInput, setLatInput] = useState(gpsCoordinates?.lat?.toString() || '');
  const [lngInput, setLngInput] = useState(gpsCoordinates?.lng?.toString() || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetDefaultCoords = () => {
    // Bangalore Tech Hub (witty placeholder fallback)
    const defaultCoords = { lat: 12.9716, lng: 77.5946 };
    setGpsCoordinates(defaultCoords);
    setLatInput(defaultCoords.lat.toString());
    setLngInput(defaultCoords.lng.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name');
    if (!phone.trim()) return setError('Please enter your phone number');
    
    const latitude = parseFloat(latInput);
    const longitude = parseFloat(lngInput);

    if (isNaN(latitude) || isNaN(longitude)) {
      return setError('Please provide valid decimal location coordinates.');
    }

    setError('');
    setLoading(true);

    try {
      await updateProfile(name, phone, latitude, longitude);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl p-8 border border-slate-800 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-4 border border-emerald-500/20">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Complete Profile
          </h2>
          <p className="text-sm text-slate-400">
            Let local clients or professionals discover you on the marketplace.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ajit Patra"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
              required
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
              required
            />
          </div>

          {/* Coordinate Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Geospatial Coordinates</span>
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Latitude</span>
                <input
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="e.g. 12.9716"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                  required
                />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Longitude</span>
                <input
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  placeholder="e.g. 77.5946"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

            {gpsCoordinates ? (
              <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Active location loaded from device parameters.</span>
              </p>
            ) : (
              <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">GPS location blocked.</span>
                <button
                  type="button"
                  onClick={handleSetDefaultCoords}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  Load Default Coordinates
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>Complete My Profile</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
