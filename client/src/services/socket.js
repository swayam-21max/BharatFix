import { io } from 'socket.io-client';

// Determine Socket.io server connection URL based on API base URL or current location
const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
    : window.location.origin;

// Detect if running on Vercel serverless static host where WebSockets aren't natively hosted
const isVercelHost = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

export const socket = io(SOCKET_URL, {
    autoConnect: !isVercelHost, // Disable auto socket connect on Vercel serverless
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: 2
});

// Suppress unhandled socket connect errors gracefully
socket.on('connect_error', (err) => {
    // Silent failover on serverless environments
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
