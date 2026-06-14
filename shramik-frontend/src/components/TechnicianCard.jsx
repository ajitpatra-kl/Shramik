import React, { useRef, useState } from "react";
import {
  Star,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Shield,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL } from "../services/api";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TECHNICIAN CARD — Premium 2-Column Design
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LEFT: Video player / Avatar
 * RIGHT: Technician details, rating, skills, Chat button
 */

const VideoPlayer = ({ url }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div
      className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden group cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={`${API_BASE_URL}${url}`}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
      />

      {/* Play/Pause Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 
          ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
      >
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
          {playing ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white fill-white" />
          )}
        </div>
      </div>

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-lg text-white/70 
          hover:text-white transition opacity-0 group-hover:opacity-100"
      >
        {muted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {/* LIVE Badge */}
      {playing && (
        <div
          className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 px-2 py-1 
          rounded text-[10px] font-black text-white"
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
};

const AvatarPlaceholder = ({ name }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-900">
    <div
      className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center 
      justify-center font-black text-slate-400 text-lg"
    >
      {name.substring(0, 2).toUpperCase()}
    </div>
    <p className="text-xs text-slate-500 font-medium text-center px-2">
      No video intro yet
    </p>
  </div>
);

const TechnicianCard = ({ technician, user, distanceInKm, onChatClick }) => {
  const hasVideo = !!technician?.videoIntroUrl;
  const rating = technician?.avgRating || 4.8;
  const totalJobs = technician?.totalJobs || 0;
  const pricePerHour = technician?.pricePerHour || "N/A";
  const skills = technician?.skills || [];
  const isVerified = technician?.verificationStatus === "APPROVED";

  return (
    <div
      className="glass-card border border-slate-800/60 rounded-2xl overflow-hidden
      hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl 
      hover:shadow-indigo-500/10 hover:-translate-y-1 group"
    >
      <div className="flex flex-col sm:flex-row min-h-[200px] sm:min-h-[160px]">
        {/* ═══ LEFT: VIDEO / AVATAR ═══ */}
        <div className="w-full sm:w-[180px] shrink-0 bg-slate-900/60 relative h-[200px] sm:h-auto">
          {hasVideo ? (
            <VideoPlayer url={technician.videoIntroUrl} />
          ) : (
            <AvatarPlaceholder name={user?.name || "Tech"} />
          )}
        </div>

        {/* ═══ RIGHT: INFO PANEL ═══ */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          {/* Name & Verification */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                    {user?.name || "Technician"}
                  </h3>
                  <span
                    className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 
                    animate-pulse"
                  />
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold 
                        bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="text-[11px] text-slate-500 font-medium px-2 py-1">
                      +{skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Verification Badge */}
              {isVerified && (
                <div
                  className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold 
                  shrink-0"
                >
                  <Shield className="w-4 h-4" />
                  Verified
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-white">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  Rating
                </p>
              </div>

              <div className="text-center">
                <div className="text-sm sm:text-base font-bold text-white">
                  {totalJobs}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  Jobs Done
                </p>
              </div>

              <div className="text-center sm:text-right">
                <div
                  className="flex items-center justify-center sm:justify-end gap-1 text-slate-300 
                  text-sm sm:text-base font-bold"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {distanceInKm} km
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                  Away
                </p>
              </div>
            </div>

            {/* Price Badge */}
            {pricePerHour !== "N/A" && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/8 border 
                border-emerald-500/30 rounded-lg mb-4"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm text-emerald-300">
                  <strong>₹{pricePerHour}</strong>/hour
                </span>
              </div>
            )}
          </div>

          {/* Chat Button */}
          <button
            onClick={() => onChatClick()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 
              hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg 
              transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianCard;
