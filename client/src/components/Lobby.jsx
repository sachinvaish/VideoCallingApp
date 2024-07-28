import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

export default function Lobby() {

  const [email, setEmail]= useState('');
  const [roomID, setRoomID]= useState('');
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = (e)=>{
    e.preventDefault();
    console.log({email, roomID});
    socket.emit('room:join',({email,roomID}));
  }

  const handleJoinRoom = (data)=>{
    const {email, roomID} = data;
    navigate(`/chatroom/${roomID}`);
  }

  useEffect(()=>{
    socket.on('room:join',handleJoinRoom)
    return()=>socket.off('room:join')
  },[socket])

  return (
    <div>
        <h1 className="sm:text-5xl text-3xl text-blue-800 font-bold mb-10">Lobby Room</h1>
      <div className="flex justify-center  ">
        <form
          id="form"
          onSubmit={handleSubmit}
          className=" bg-slate-100 rounded xl:w-[30%] w-[80%] h-[30%] p-[30px] flex flex-col items-center"
        >
          <div className="input-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email"  value={email} onChange={(e)=>setEmail(e.target.value)} required/>
          </div>
          <div  className="input-field">
            <label htmlFor="room-id">Room ID</label>
            <input id="room-id" name="room-id" type="text" value={roomID} onChange={(e)=>setRoomID(e.target.value)} required/>
          </div>
          <button type="submit" className="btn btn-primary">Enter</button>

        </form>
      </div>
    </div>
  );
}
