const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

let drawingHistory = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send history to new user
    socket.emit('history', drawingHistory);

    socket.on('draw', (data) => {
        // Save the stroke with the persistent userId sent from client
        drawingHistory.push(data); 
        socket.broadcast.emit('draw', data);
    });

    socket.on('undo', (userId) => {
        // Find the LAST action by THIS specific userId
        let indexToRemove = -1;
        for (let i = drawingHistory.length - 1; i >= 0; i--) {
            // We check matching userId, NOT socket.id
            if (drawingHistory[i].userId === userId) {
                indexToRemove = i;
                break;
            }
        }

        if (indexToRemove !== -1) {
            drawingHistory.splice(indexToRemove, 1);
            io.emit('history', drawingHistory);
        }
    });

    // Handle Cursor Movement
    socket.on('cursor', (data) => {
        // Broadcast to everyone else
        socket.broadcast.emit('cursor', data);
    });

    socket.on('clear', () => {
        drawingHistory = [];
        io.emit('history', drawingHistory);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});