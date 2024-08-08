const {Server} = require('socket.io');

const io = new Server(8000,{
    cors:true
});

const socketToEmail = new Map();
const emailToSOcket = new Map();

io.on('connection',(socket)=>{
    console.log('SOcket Connected with ID :', socket.id);
    socket.on('room:join',(data)=>{
        // console.log({email, roomID});
        const {email, roomID} = data;
        socketToEmail.set(socket.id,email)
        emailToSOcket.set(email,socket.id)

        io.to(roomID).emit('user:joined',{email, id:socket.id});
        socket.join(roomID);

        io.to(socket.id).emit('room:join',(data));

        socket.on('room:exit',(data)=>{
            io.to(roomID).emit('user:left',socketToEmail.get(data));
        })
    })

    socket.on('user:call',({to, offer})=>{
        io.to(to).emit('incoming:call',{from:socket.id, offer});
    })

    socket.on('call:accepted',({to,ans})=>{
        io.to(to).emit('call:accepted',{from:socket.id, ans})
    })

    socket.on('peer:nego:needed',({to, offer})=>{
        io.to(to).emit('peer:nego:needed',{from :socket.id, offer})
    })
    
    socket.on('peer:nego:done',({to, ans})=>{
        io.to(to).emit('peer:nego:final',{from:socket.id, ans});
    })
})



