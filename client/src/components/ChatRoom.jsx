import React, { useEffect, useState } from 'react'
import { createRoutesFromElements, useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import { FaVideo, FaVideoSlash } from "react-icons/fa6";

export default function ChatRoom() {
  const {roomID} = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [remoteUser, setRemoteUser]=useState({});
  const [members, setMembers] = useState([]);
  const [myCamera,setMyCamera]=useState(false);
  const [myStream, setMyStream]=useState('');

  const leaveRoom = ()=>{
    socket.emit('room:exit',socket.id);
    navigate('/')
  }

  const handleUserJoined = (data)=>{
    const {email, id} = data;
    console.log(`${email} joined the Chatroom  ID : ${id}`);
    setRemoteUser({email,id})
    setMembers((members)=>[...members,email]);
  }

  const handleUserLeft = (data)=>{
      console.log(`${data} Left the Room`);
      setRemoteSocket('');
      setRemoteEmail('');
  }

  const handleCall=()=>{
    console.log('Calling the Remote User');
    // const stream = navigator.mediaDevices.getUserMedia({video: true, audio:true});
    // if(stream){
    //   setMyStream(stream);
    // }
  }

  const handleStream=async()=>{
    let stream;
    if(!myCamera){
      stream = await navigator.mediaDevices.getUserMedia({video: true, audio:true});
      if(stream){
        setMyStream(stream);
        setMyCamera(true)
      }
    }else{
      setMyStream('');
      setMyCamera(false)
    }
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
      {remoteUser.id ? <h2>You're joined in Room : {roomID}</h2> : <h2>No one in this Room</h2>}
      {remoteUser.id &&
        <div id='videoStream' className='flex flex-col lg:flex-row gap-5  min-w-max items-center lg:justify-center mt-5'>
        <div id='user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>You</h3>
          {/* <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Your Stream</div> */}
          <ReactPlayer playing url={myStream} width={'30em'} height={'20em'} style={{border:'2px solid red'}} />
          <div className='flex gap-4'>
            {myCamera ? <FaVideoSlash onClick={handleStream}/> : <FaVideo onClick={handleStream}/>}
          </div>
        </div>
        {remoteUser.email &&
          <div id='remote-user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>{remoteUser.email}</h3>
          <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Receiver's Stream</div>
        </div>
        }
      </div>

      }
      <div id='controls' className='flex justify-center w-full'>
          {remoteUser.id && <button className='btn btn-green' onClick={handleCall}>Call</button>}
        </div>
    </div>
  )
}
