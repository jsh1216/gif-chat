import express from 'express'
import path from 'path'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'
import dotenv from 'dotenv'
import ColorHash from 'color-hash'

import webSocket from './socket'
import indexRouter from './routes'
import connect from './schemas'

const app = express()
connect()
dotenv.config({ path: path.join(__dirname, '.env') })

const sessionMiddleware = session({
  cookie: {
    httpOnly: true,
    secure: false,
  },
  resave: false,
  saveUninitialized: false,
  //스트링 값만 허용이 되기 때문에 undefined는 허용하지 않는다 그렇기 때문에 ??를 사용하여 비어 있는 값을 체크 해준다  ''
  //??는 undefined와 null에만 적용 ||는 '', 0, false, undefined, null, NaN 등 적용
  secret: process.env.COOKIE_SECRET ?? '',
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.set('port', 8005)

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/gif', express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(sessionMiddleware)
app.use(flash())

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    /*
      물음표를 붙이게 되면 위에 물음표 이전에 있던 내용을 if문으로 처리 해주는 것과 동일하다
      if(req.session?color){} 는 아래와 동일
      if (req.session) {
        if (req.session.color) {

        }
      }
    */
    if (req.session) {
      if (req.session.color) {
        //없음
      } else {
        const colorHash = new ColorHash()
        if (req.sessionID) {
          req.session.color = colorHash.hex(req.sessionID) //세션 아이디로 컬러를 바꿀 수 있다
        }
      }
    }
    next()
  },
)

app.use('/', indexRouter)

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const err: any = new Error('Not Found')
    err.status = 404
    next(err)
  },
)

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500)
    res.render('error')
  },
)

const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중')
})

webSocket(server, app, sessionMiddleware)
