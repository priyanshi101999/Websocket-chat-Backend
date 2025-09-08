const http = require('http')
const { Server } = require('socket.io')
const express = require('express')
const { timeStamp } = require('console')


const app = express()
const server = new http.createServer(app)
let room = {};

const io = new Server(server,
     {
    cors: {
        origin: 'http://localhost:3000',
        method: ['post', 'get']
    }
}
)

io.on('connection', (socket) => {
    console.log(`connected with ${socket.id}`)

    socket.on('join-room', ({roomCode, userName}) => {
        console.log(room[roomCode]['roomName']);

        socket.join(roomCode);
        
        socket.to(roomCode).emit('message', { 'message': `${userName} join ${room[roomCode]['roomName']}` })
    })

    socket.on('user-typing', (({ roomCode, userName }) => {
        socket.to(roomCode).emit('user-typing', { userName })
    }))

    socket.on('stop-typing', (({ roomCode, userName }) => {
        socket.to(roomCode).emit('stop-typing', { userName })
    }))

    socket.on('room-message', ({ roomCode, message, userName }) => {
        io.to(roomCode).emit('message', {
            message: message,
            from: userName || socket.id,
            timeStamp: new Date().toLocaleTimeString()
        })
    })

    socket.on('create-room', ({ roomCode, roomName, userName }) => {
        console.log(roomCode, roomName);
        
        room[roomCode] = { roomName, user: [] }
        console.log(room);
        socket.join(roomCode)
        io.to(roomCode).emit('message', {roomName, roomCode, 'message': `You joined ${room[roomCode]['roomName']}` })

    })
    socket.on('disconnect', () => {
        console.log(`disconnected ${socket.id}`);
    })
})


server.listen(9090, () => {
    console.log("server is listening on 9090");
})

