import SocketIO from 'socket.io'
import axios from 'axios'
import http from 'http'
import express from 'express'

export default (
  server: http.Server,
  app: express.Express,
  sessionMiddleware: express.RequestHandler,
) => {
  const io = SocketIO(server, { path: '/socket.io' })
  app.set('io', io) // app.set('io', io)로 io객체를 쓸수 있게 저장 req.app.get('io')로 접근 가능
  const room = io.of('/room') // of는 Socket.io에 네임스페이스를 부여하는 메서드 기본적으론 /로 접근
  const chat = io.of('/chat')

  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next)
  })

  room.on('connection', socket => {
    console.log('room 네임스페이스에 접속')
    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제')
    })
  })

  chat.on('connection', socket => {
    console.log('chat 네임스페이스에 접속')
    const req = socket.request
    const {
      headers: { referer },
    } = req
    const roomId = referer
      .split('/')
      [referer.split('/').length - 1].replace(/\?.+/, '')
    socket.join(roomId)
    socket.to(roomId).emit('join', {
      chat: `${req.session.color}님이 입장하셨습니다.`,
      user: 'system',
    })
    socket.on('disconnect', () => {
      console.log('chat 네임스페이스 접속 해제')
      socket.leave(roomId)
      const currentRoom = socket.adapter.rooms[roomId]
      const userCount = currentRoom ? currentRoom.length : 0
      if (userCount === 0) {
        axios
          .delete(`http://localhost:8005/room/${roomId}`)
          .then(() => {
            console.log('방 제거 요청 성공')
          })
          .catch(error => {
            console.error(error)
          })
      } else {
        socket.to(roomId).emit('exit', {
          chat: `${req.session.color}님이 퇴장하셨습니다.`,
          user: 'system',
        })
      }
    })
  })
}
