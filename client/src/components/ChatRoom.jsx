import React, { useEffect, useState } from 'react'
import { createRoutesFromElements, useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../context/SocketProvider';

export default function ChatRoom() {
  const {roomID} = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [remoteSocketID, setRemoteSocketID]=useState('');
  const [remoteEmail,setRemoteEmail]=useState('')
  const [members, setMembers] = useState([]);

  const leaveRoom = ()=>{
    socket.emit('room:exit',socket.id);
    navigate('/')
  }

  const handleUserJoined = (data)=>{
    const {email, socketID} = data;
    console.log(`${email} joined the Chatroom`);
    setRemoteSocketID(socketID);
    setRemoteEmail(email);
    setMembers((members)=>[...members,email]);
  }

  const handleUserLeft = (data)=>{
      console.log(`${data} Left the Room`);
  }

  useEffect(()=>{
      socket.on('user:joined',handleUserJoined)
      socket.on('user:left',handleUserLeft)
      return ()=>{
        socket.off('user:joined',handleUserJoined);
        socket.off('user:left',handleUserLeft);
      }
  },[socket])

  return (
    <div>
      <div className='flex justify-between mx-10'>
        <button className='btn btn-secondary ' onClick={()=>navigate('/')}>Back</button>
        <h1 className="sm:text-5xl text-3xl text-blue-800 font-bold mb-10 ">Chat Room</h1>
        <button className='btn btn-danger ' onClick={leaveRoom}>Leave Room</button>
      </div>
      <div id='videoStream' className='flex flex-col lg:flex-row gap-5  min-w-max items-center lg:justify-center mt-5'>
        <div id='user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>You</h3>
          <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Your Stream</div>
        </div>
        {remoteEmail &&
          <div id='remote-user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>{remoteEmail}</h3>
          <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Receiver's Stream</div>
        </div>
        }
      </div>
      <div id='controls' className='flex justify-center w-full'>
          <button className='btn btn-green'>Accept Call</button>
        </div>
    </div>
  )
}
