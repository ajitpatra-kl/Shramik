import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";
import {
  X,
  Send,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAT DRAWER — WebSocket Communication + Booking Modal
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Real-time WebSocket messaging
 * - Request Booking button
 * - Sleek booking modal with date/time/description
 * - Integration with /api/bookings endpoint
 */

const BookingModal = ({ isOpen, onClose, tech, userId, onBookingSubmit }) => {
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestedDate || !description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateTimeString = `${requestedDate}T${requestedTime}:00`;
      const bookingData = {
        technicianId: tech.technician.id,
        description: description.trim(),
        requestedDate: dateTimeString,
      };

      const response = await api.post("/api/bookings", bookingData);

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          setRequestedDate("");
          setRequestedTime("10:00");
          setDescription("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err.response?.data?.error || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md glass-card border border-slate-800 rounded-2xl shadow-2xl 
        overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.4,0,0.2,1)]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 
              flex items-center justify-center font-bold text-indigo-400 text-sm"
            >
              {tech.user?.name?.substring(0, 2).toUpperCase() || "T"}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Book a Service</h3>
              <p className="text-xs text-slate-400">{tech.user?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">
                Booking Requested!
              </h4>
              <p className="text-sm text-slate-400">
                Your booking request has been sent to the technician
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Field */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white 
                    rounded-lg focus:outline-none focus:border-indigo-500 transition text-sm"
                  required
                />
              </div>

              {/* Time Field */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white 
                    rounded-lg focus:outline-none focus:border-indigo-500 transition text-sm"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                  Work Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the work you need done..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white 
                    placeholder-slate-500 rounded-lg focus:outline-none focus:border-indigo-500 
                    transition text-sm resize-none h-24"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* Technician Info Card */}
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Rate:</span>
                  <span className="font-bold text-white">
                    ₹{tech.technician?.pricePerHour || "N/A"}/hour
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Rating:</span>
                  <span className="font-bold text-yellow-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {(tech.technician?.avgRating || 4.8).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 
                  hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg 
                  transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center 
                  justify-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Request Booking
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatDrawer = ({ isOpen, onClose, tech, avgPrice }) => {
  const { userId } = useAuth();
  const { stompClient, connected, sendMessage } = useSocket();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const messagesEndRef = useRef(null);
  const remoteParticipantId =
    tech?.user?.id || tech?.technician?.userId || tech?.technician?.id || null;
  const chatRoomId = [userId, remoteParticipantId]
    .filter(Boolean)
    .sort()
    .join("_");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to messages when drawer opens
  useEffect(() => {
    if (!isOpen || !stompClient || !connected || !chatRoomId) return;

    const subscription = stompClient.subscribe(
      `/topic/chat/${chatRoomId}`,
      (frame) => {
        try {
          const message = JSON.parse(frame.body);
          setMessages((prev) => [
            ...prev,
            {
              ...message,
              content: message.content ?? message.message ?? "",
            },
          ]);
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      },
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isOpen, stompClient, connected, chatRoomId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !stompClient || !connected || !chatRoomId)
      return;

    setSending(true);

    try {
      sendMessage(chatRoomId, userId, "USER", messageText.trim());

      setMessages((prev) => [
        ...prev,
        {
          senderId: userId,
          senderName: "You",
          content: messageText.trim(),
          message: messageText.trim(),
          timestamp: new Date().toISOString(),
        },
      ]);
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800 
        z-50 flex flex-col shadow-2xl animate-[slideIn_0.3s_cubic-bezier(0.4,0,0.2,1)]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 
              flex items-center justify-center font-bold text-indigo-400 text-sm"
            >
              {tech.user?.name?.substring(0, 2).toUpperCase() || "T"}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {tech.user?.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Banner */}
        {avgPrice && (
          <div
            className="px-4 py-2.5 bg-indigo-950/80 border-b border-indigo-900/50 
            text-[11px] text-indigo-300 flex items-start gap-2"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="leading-snug">
              Average rate for{" "}
              <strong>{tech.technician?.skills?.[0] || "this service"}</strong>{" "}
              in your area is{" "}
              <strong className="text-indigo-200">₹{avgPrice}</strong>. Keep
              negotiations transparent.
            </span>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 text-sm">
                No messages yet. Start a conversation!
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isOwn = msg.senderId === userId;
            return (
              <div
                key={idx}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-xl ${
                    isOwn
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${isOwn ? "text-indigo-200" : "text-slate-500"}`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Request Booking Button */}
        <div className="px-5 py-3 border-t border-slate-800/60">
          <button
            onClick={() => setShowBookingModal(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold 
              rounded-lg transition flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Request Booking
          </button>
        </div>

        {/* Message Input */}
        <div className="px-5 py-4 border-t border-slate-800/60">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              disabled={!connected || sending}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-white 
                placeholder-slate-500 rounded-lg focus:outline-none focus:border-indigo-500 
                transition text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || !connected || sending}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold 
                rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed 
                flex items-center justify-center"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        tech={tech}
        userId={userId}
        onBookingSubmit={() => {
          setShowBookingModal(false);
        }}
      />
    </>
  );
};

export default ChatDrawer;
