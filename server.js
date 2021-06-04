const cors = require('cors');
const path = require('path');
const http = require('http');
const alert = require('alert');
const express = require('express');
const socketio = require('socket.io');
const stringify = require('./utils/mixins');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = socketio(server);
const botName = 'CHATit Bot';
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname,'public')));
//Run when client connects
io.on('connection', socket => {
    console.log('inside connection');
    socket.on('joinRoom', ({ username, room }) => {
        console.log('inside join room'+socket.id);
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcomes current user
        socket.emit('message',formatMessage(botName, 'Welcome to CHATit!'));

        //Broadcast to all users when the user connects except to the user who connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} has joined the chat`));

        //Broadcast to all the users
        //io.emit();

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        if(user) {
            io.to(user.room).emit('message',formatMessage(user.username, message));
        } else {
            alert('Your connection was broken. Please try joining room again');
        } 
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message',formatMessage(botName, `${user.username} has left the chat`));
            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }      
    })

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));