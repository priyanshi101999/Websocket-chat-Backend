const http = require('http')
const { Server } = require('socket.io')
const express = require('express')
const cors = require('cors');
const PORT = process.env.PORT || 9090;
const app = express()
app.use(cors())
const server = new http.createServer(app)
let room = {};

const io = new Server(server,
    {
        cors: {
            origin: 'https://websocket-chat-gos68qc5r-priyanshi-tripathis-projects.vercel.app',
            method: ['post', 'get']
        }
    }
)

io.on('connection', (socket) => {
    console.log('connected');
    
    socket.on('join-room', ({ roomCode, userName }) => {
        socket.join(roomCode);
        console.log(room);
        socket.emit('message', { 'message': `You join ${room[roomCode].roomName}` , roomName: room[roomCode]['roomName']? room[roomCode]['roomName']:''})
        socket.to(roomCode).emit('message', { 'message': `${userName} join ${room[roomCode].roomName}` , roomName: room[roomCode].roomName})
    })

    socket.on('user-typing', (({ roomCode, userName }) => {
        socket.to(roomCode).emit('user-typing', { userName })
    }))

    socket.on('stop-typing', (({ roomCode, userName }) => {
        socket.to(roomCode).emit('stop-typing', { userName })
    }))

    socket.on('room-message', ({ roomCode, message, userName }) => {
        socket.emit('message', {
            message,
            from: 'You',
            timeStamp : new Date().toLocaleTimeString()
        });

        socket.to(roomCode).emit('message', {
            message,
            from: userName || socket.id,
            timeStamp: new Date().toLocaleTimeString()
        });
    })

    socket.on('create-room', ({ roomCode, roomName, userName }) => {
  
        
        room[roomCode] = room[roomCode] || { roomName, users: [] };
        console.log(room);
        socket.join(roomCode)
        io.to(roomCode).emit('message', { roomName, roomCode, 'message': `You join ${room[roomCode]['roomName']}` })

    })
    socket.on('disconnect', () => {
        console.log(`disconnected ${socket.id}`);
    })
})


server.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
})

app.get('/', (req, res) => {
  res.send('Server is running!');
});


