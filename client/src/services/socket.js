import { io } from 'socket.io-client';

// Determine Socket.io server connection URL based on API base URL or current location
const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : window.location.origin;

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
});

// Helper functions for joining rooms
export const joinUserRoom = (userId) => {
    if (userId && socket.connected) {
        socket.emit('join_user_room', userId);
    }
};

export const joinComplaintRoom = (complaintId) => {
    if (complaintId && socket.connected) {
        socket.emit('join_complaint_room', complaintId);
    }
};

export default socket;
