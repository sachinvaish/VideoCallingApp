import { useState } from 'react'
import './App.css'
import ChatRoom from './components/ChatRoom'
import Lobby from './components/Lobby'
import {Routes, Route} from 'react-router-dom'


function App() {

  return (
    <div className=' content-center text-center mt-10'>
    <Routes>
      <Route path='/' element={<Lobby/>} />
      <Route path='/chatroom/:roomID' element={<ChatRoom/>} />
    </Routes>
    </div>
  )
}

export default App
