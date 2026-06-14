import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (stompClient) {
        stompClient.deactivate();
        setStompClient(null);
        setConnected(false);
      }
      return;
    }

    logWebSocketConnection();

    // Create STOMP client over SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log("WebSocket Debug: " + str);
      },
      onConnect: () => {
        setConnected(true);
        console.log("Real-time STOMP connection active.");
      },
      onDisconnect: () => {
        setConnected(false);
        console.log("Real-time STOMP connection closed.");
      },
      onStompError: (frame) => {
        console.error("Broker STOMP error: " + frame.headers['message']);
        console.error("Details: " + frame.body);
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
      console.log("Deactivated STOMP client.");
    };
  }, [token]);

  const logWebSocketConnection = () => {
    console.log("Initializing WebSockets over STOMP connection targeting:", `${API_BASE_URL}/ws`);
  };

  const sendMessage = (chatId, senderId, senderRole, messageText) => {
    if (stompClient && connected) {
      const payload = {
        chatId,
        senderId,
        senderRole,
        message: messageText
      };
      
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(payload)
      });
      console.log("Published WS message to room:", chatId);
    } else {
      console.error("STOMP connection not active. Buffering/retrying failed.");
    }
  };

  return (
    <SocketContext.Provider value={{ stompClient, connected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
