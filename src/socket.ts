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
  app.set('io', io) // app.set('io', io)로 io객체를 쓸수 있게 저장 req.app.get('io')로 접근 가능 express 변수 저장 방법
  const room = io.of('/room') // of는 Socket.io에 네임스페이스를 부여하는 메서드 기본적으론 /로 접근
  const chat = io.of('/chat')

  //익스프레스 미들웨어를 소켓에서 쓰는 방법
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
    //방을 떠났을때
    socket.on('disconnect', () => {
      console.log('chat 네임스페이스 접속 해제')
      //방번호를 leave에 넣어 떠나게 한다.
      socket.leave(roomId)
      const currentRoom = socket.adapter.rooms[roomId]
      const userCount = currentRoom ? currentRoom.length : 0
      //유저가 방에 한명도 없다면 axios로 routes에 delete를 호출하여 삭제 시킨다.
      if (userCount === 0) {
        axios
          .delete(`http://localhost:8005/room/${roomId}`)
          .then(() => {
            console.log('방 제거 요청 성공')
          })
          .catch(error => {
            console.error(error)
          })
        //방에 아직 사람이 있다면 떠난 방에 나간 사람의 정보를 입력 해준다.
      } else {
        socket.to(roomId).emit('exit', {
          chat: `${req.session.color}님이 퇴장하셨습니다.`,
          user: 'system',
        })
      }
    })
  })
}
