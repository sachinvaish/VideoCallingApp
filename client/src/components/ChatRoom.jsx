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
  const [remoteUser, setRemoteUser]=useState({});
  const [myCamera,setMyCamera]=useState(false);
  const [myStream, setMyStream]=useState('');
  const [remoteStream, setRemoteStream]=useState('');

  const leaveRoom = ()=>{
    socket.emit('room:exit',socket.id);
    navigate('/')
  }

  const handleUserJoined = (data)=>{
    const {email, id} = data;
    console.log(`${email} joined the Chatroom  ID : ${id}`);
    setRemoteUser({email,id})
  }

  const handleUserLeft = (data)=>{
      console.log(`${data} Left the Room`);
      setRemoteUser('');
  }

  const handleCall=async()=>{
    console.log('Calling the Remote User');
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio:true});
    const offer = await peer.getOffer();
    socket.emit('user:call',{ to:remoteUser.id, offer})
    setMyStream(stream);
  }

  const handleIncomingCall=async({from, offer})=>{
    // await handleStream();
    setRemoteUser({...remoteUser, id:from});
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio:true});
    setMyStream(stream);
    console.log('incoming call from :',from, offer)
    const ans = await peer.getAnswer(offer);
    socket.emit('call:accepted',{to:from, ans});
  }

  const sendStreams = ()=>{
    for(const track of myStream.getTracks()){
      peer.peer.addTrack(track, myStream);
    }
  }

  const handleCallAccepted = async({from, ans})=>{
    setRemoteUser({...remoteUser, id:from});
    peer.setLocalDescription(ans);
    // await handleStream();
    console.log({myStream, myCamera},remoteUser.email);
    console.log('call accepted');
    sendStreams();
  }

  // const handleStream=async()=>{
  //   let stream;
  //   // if(!myCamera){
  //     console.log(`mycamera is ${myCamera} state`)
      
  //     if(stream){
  //       setMyStream(stream);
  //       console.log('setting myCamera == true')
  //       setMyCamera(true);
  //       console.log('in HandleStream()',{stream, myStream, myCamera});
  //     }
      
  //   // }else{
  //   //   console.log('mycamera is ON state')
  //   //   setMyStream('');
  //   //   setMyCamera(false)
  //   // }
  // }


  useEffect(()=>{
    peer.peer.addEventListener('track',async(ev)=>{
      const remoteStream = ev.streams
      setRemoteStream(remoteStream[0]);
      console.log('remote stream',remoteStream)
    })
    console.log('useEffect track-eventlistener attached',{myCamera});
  },[])

  useEffect(()=>{
      socket.on('user:joined',handleUserJoined)
      socket.on('user:left',handleUserLeft)
      socket.on('incoming:call', handleIncomingCall);
      socket.on('call:accepted', handleCallAccepted);
      console.log('common useEffect called',{myCamera});
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
      {remoteUser.id ? <h2>You're joined in Room : {roomID}</h2> : <h2>No one in this Room</h2>}
      {remoteUser.id &&
        <div id='videoStream' className='flex flex-col lg:flex-row gap-5  min-w-max items-center lg:justify-center mt-5'>
        <div id='user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>You</h3>
          {/* <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Your Stream</div> */}
          <ReactPlayer playing url={myStream} width={'30em'} height={'20em'} style={{border:'2px solid red',transform:'rotateY(180deg)'}} />
        </div>
        {remoteUser.email &&
          <div id='remote-user-stream' className='flex flex-col'>
          <h3 className=' font-bold'>{remoteUser.email}</h3>
          {/* <div style={{width:'30em', height:'20em'}} className=' bg-slate-400'>Receiver's Stream</div> */}
          <ReactPlayer playing url={remoteStream} width={'30em'} height={'20em'} style={{border:'2px solid red'}} />
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
