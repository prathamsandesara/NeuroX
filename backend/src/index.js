const app = require('./app');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NeuroX] Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[NeuroX] Local debug URL: http://localhost:${PORT}`);
    }
});

// Initialize Socket.io for WebRTC Signaling
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Re-using the logic from app.js would be better, but for simplicity here:
            if (!origin || process.env.NODE_ENV !== 'production') return callback(null, true);
            const origins = [process.env.FRONTEND_URL].filter(Boolean);
            if (origins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join a room based on submissionId or candidateId for targeted signaling
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`[Socket.io] ${socket.id} joined room: ${roomId}`);
        socket.to(roomId).emit('user-connected', socket.id);
    });

    // WebRTC Signaling: Forward offer, answer, and ICE candidates
    socket.on('webrtc-offer', (data) => {
        socket.to(data.roomId).emit('webrtc-offer', { offer: data.offer, sender: socket.id });
    });

    socket.on('webrtc-answer', (data) => {
        socket.to(data.roomId).emit('webrtc-answer', { answer: data.answer, sender: socket.id });
    });

    socket.on('webrtc-ice-candidate', (data) => {
        socket.to(data.roomId).emit('webrtc-ice-candidate', { candidate: data.candidate, sender: socket.id });
    });

    socket.on('request-negotiation', (data) => {
        socket.to(data.roomId).emit('request-negotiation', { sender: socket.id });
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        // Notify others if needed
        io.emit('user-disconnected', socket.id);
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[ERROR] Port ${PORT} is already in use. Kill the process first:\n  kill -9 $(lsof -ti:${PORT})\nThen restart.\n`);
        process.exit(1);
    } else {
        throw err;
    }
});
