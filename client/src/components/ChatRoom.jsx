import React, { useEffect, useState } from 'react'
import { createRoutesFromElements, useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import { FaVideo, FaVideoSlash } from "react-icons/fa6";
import peer from '../service/peer';

export default function ChatRoom() {
  const {roomID} = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const[remoteSocket, setRemoteSocket]=useState('');
  const [myStream, setMyStream]=useState('');
  const [remoteStream, setRemoteStream]=useState('');

  const leaveRoom = ()=>{
    console.log('function : leaveRoom()',{myStream});
    socket.emit('room:exit',socket.id);
    navigate('/')
  }

  const handleUserJoined = (data)=>{
    console.log('function : handleUserJoined()',{myStream});
    const {email, id} = data;
    console.log(`${email} joined the Chatroom  ID : ${id}`);
    setRemoteSocket(id);
  }

  const handleUserLeft = (data)=>{
    console.log('function : handleUserLeft()',{myStream});
      console.log(`${data} Left the Room`);
      setRemoteSocket('');
  }

  const handleCall=async()=>{
    console.log('function : handleCall()',{myStream});
    console.log('Calling the Remote User');
    // const stream = await navigator.mediaDevices.getUserMedia({video: true, audio:true});
    const offer = await peer.getOffer();
    socket.emit('user:call',{ to:remoteSocket, offer})
    // setMyStream(stream);
  }

  const handleIncomingCall=async({from, offer})=>{
    console.log('function : handleIncomingCall()',{myStream});
    setRemoteSocket(from);
    // const stream = await navigator.mediaDevices.getUserMedia({video: true, audio:true});
    // setMyStream(stream);
    console.log('incoming call from :',from, offer)
    const ans = await peer.getAnswer(offer);
    socket.emit('call:accepted',{to:from, ans});
    sendStreams();
  }

  const sendStreams = async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio:true});
    console.log('sendStream - ',{stream});
    setMyStream(stream);
    const tracks = stream.getTracks();
    for(const track of tracks){
      peer.peer.addTrack(track, stream);
    }
  }

  const handleCallAccepted =({from, ans})=>{
    console.log('function : handleCallAccepted()',{myStream});
    setRemoteSocket(from);
    peer.setLocalDescription(ans);
    console.log({myStream, from,ans, remoteSocket});
    console.log('call accepted');
    sendStreams();
  }

  useEffect(()=>{
    console.log('function : useEffect(blank)');
    peer.peer.addEventListener('track',async(ev)=>{
      const remoteStream = ev.streams
      setRemoteStream(remoteStream[0]);
      console.log('remote stream',remoteStream)
    })
    console.log('useEffect track-eventlistener attached');
  },[])

  useEffect(()=>{
    console.log('function : useEffect([socket])');
      socket.on('user:joined',handleUserJoined)
      socket.on('user:left',handleUserLeft)
      socket.on('incoming:call', handleIncomingCall);
      socket.on('call:accepted', handleCallAccepted);
      console.log('common useEffect called');
      return ()=>{
        socket.off('user:joined',handleUserJoined);
        socket.off('user:left',handleUserLeft);
        socket.off('incoming:call', handleIncomingCall);
        socket.off('call:accepted', handleCallAccepted);
      }
  },[socket])

  return (
    <div>
      <div className='flex justify-between mx-10'>
        <button className='btn btn-secondary ' onClick={()=>navigate('/')}>Back</button>
        <h1 className="sm:text-5xl text-3xl text-blue-800 font-bold mb-10 ">Chat Room</h1>
        <button className='btn btn-danger ' onClick={leaveRoom}>Leave Room</button>
      </div>
      {remoteSocket ? <h2>You're joined in Room : {roomID}</h2> : <h2>No one in this Room</h2>}
      {remoteSocket &&
        <div id='videoStream' className='flex flex-col lg:flex-row gap-5  min-w-max items-center lg:justify-center mt-5'>
        <div id='user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>You</h3>
          {/* <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Your Stream</div> */}
          <ReactPlayer playing url={myStream} width={'30em'} height={'20em'} style={{border:'2px solid red',transform:'rotateY(180deg)'}} />
        </div>
        {remoteSocket &&
          <div id='remote-user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>Receiver's Stream {remoteSocket} id</h3>
          {/* <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Receiver's Stream</div> */}
          <ReactPlayer playing url={remoteStream} width={'30em'} height={'20em'} style={{border:'2px solid red'}} />
        </div>
        }
      </div>

      }
      <div id='controls' className='flex justify-center w-full'>
          {remoteSocket && <button className='btn btn-green' onClick={handleCall}>Call</button>}
        </div>
    </div>
  )
}
