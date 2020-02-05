import express from 'express'

import { Room, RoomSchema } from '../schemas/room'
import { ChatSchema } from '../schemas/chat'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()
router.get('/', async (req, res, next) => {
  try {
    const rooms = await RoomSchema.find({})
    res.render('main', {
      error: req.flash('roomError'),
      rooms,
      title: 'GIF 채팅방',
    })
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.get('/room', (req, res) => {
  res.render('room', { title: 'GIF 채팅방 생성' })
})

//방생성
router.post('/room', async (req, res, next) => {
  try {
    const room = new RoomSchema({
      max: req.body.max,
      owner: req.session?.color,
      password: req.body.password,
      title: req.body.title,
    })
    const newRoom = await room.save()
    const io = req.app.get('io')
    io.of('/room').emit('newRoom', newRoom)
    res.redirect(`/room/${newRoom._id}?password=${req.body.password}`)
  } catch (error) {
    console.error(error)
    next(error)
  }
})

//방 들어가기
router.get('/room/:id', async (req, res, next) => {
  try {
    const document = await RoomSchema.findOne({ _id: req.params.id })
    const io = req.app.get('io')
    if (!document) {
      req.flash('roomError', '존재하지 않는 방입니다.')
      return res.redirect('/')
    }
    const room: Room = document.toObject()
    if (room.password && room.password !== req.query.password) {
      req.flash('roomError', '비밀번호가 틀렸습니다.')
      return res.redirect('/')
    }
    const { rooms } = io.of('/chat').adapter
    if (
      rooms &&
      rooms[req.params.id] &&
      room.max <= rooms[req.params.id].length
    ) {
      req.flash('roomError', '허용 인원이 초과하였습니다.')
      return res.redirect('/')
    }
    console.log(room._id)
    const chats = await ChatSchema.find({ room: room._id }).sort('creaatedAt')

    return res.render('chat', {
      chats,
      room,
      title: room.title,
      user: req.session?.color,
    })
  } catch (error) {
    console.error(error)
    return next(error)
  }
})

router.delete('/room/:id', async (req, res, next) => {
  try {
    await RoomSchema.remove({ _id: req.params.id })
    await ChatSchema.remove({ room: req.params.id })
    res.send('ok')
    setTimeout(() => {
      req.app
        .get('io')
        .of('/room')
        .emit('removeRoom', req.params.id)
    }, 2000)
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.post(
  '/room/:id/chat',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const chat = new ChatSchema({
        chat: req.body.chat,
        room: req.params.id,
        user: req.session?.color,
      })

      await chat.save()
      req.app
        .get('io')
        .of('/chat')
        .to(req.params.id)
        .emit('chat', chat)
      res.send('ok')
    } catch (error) {
      console.error(error)
      next(error)
    }
  },
)

fs.readdir('lib/uploads', error => {
  if (error) {
    console.error('uploads 폴더가 없어서 uploads 폴더를 생성 합니다.')
    fs.mkdirSync('lib/uploads')
  }
})

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'lib/uploads/')
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname)
      cb(
        null,
        path.basename(file.originalname, ext) + new Date().valueOf() + ext,
      )
    },
  }),
})

router.post('/room/:id/gif', upload.single('gif'), async (req, res, next) => {
  try {
    const chat = new ChatSchema({
      gif: req.file.filename,
      room: req.params.id,
      user: req.session?.color,
    })
    await chat.save()
    req.app
      .get('io')
      .of('/chat')
      .to(req.params.id)
      .emit('chat', chat)
    res.send('ok')
  } catch (error) {
    console.error(error)
    next(error)
  }
})

export default router
