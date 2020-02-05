"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var axios_1 = __importDefault(require("axios"));
exports.default = (function (server, app, sessionMiddleware) {
    var io = socket_io_1.default(server, { path: '/socket.io' });
    app.set('io', io); // app.set('io', io)로 io객체를 쓸수 있게 저장 req.app.get('io')로 접근 가능 express 변수 저장 방법
    var room = io.of('/room'); // of는 Socket.io에 네임스페이스를 부여하는 메서드 기본적으론 /로 접근
    var chat = io.of('/chat');
    //익스프레스 미들웨어를 소켓에서 쓰는 방법
    io.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });
    room.on('connection', function (socket) {
        console.log('room 네임스페이스에 접속');
        socket.on('disconnect', function () {
            console.log('room 네임스페이스 접속 해제');
        });
    });
    chat.on('connection', function (socket) {
        console.log('chat 네임스페이스에 접속');
        var req = socket.request;
        var referer = req.headers.referer;
        var roomId = referer
            .split('/')[referer.split('/').length - 1].replace(/\?.+/, '');
        socket.join(roomId);
        socket.to(roomId).emit('join', {
            chat: req.session.color + "\uB2D8\uC774 \uC785\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.",
            user: 'system',
        });
        //방을 떠났을때
        socket.on('disconnect', function () {
            console.log('chat 네임스페이스 접속 해제');
            //방번호를 leave에 넣어 떠나게 한다.
            socket.leave(roomId);
            var currentRoom = socket.adapter.rooms[roomId];
            var userCount = currentRoom ? currentRoom.length : 0;
            //유저가 방에 한명도 없다면 axios로 routes에 delete를 호출하여 삭제 시킨다.
            if (userCount === 0) {
                axios_1.default
                    .delete("http://localhost:8005/room/" + roomId)
                    .then(function () {
                    console.log('방 제거 요청 성공');
                })
                    .catch(function (error) {
                    console.error(error);
                });
                //방에 아직 사람이 있다면 떠난 방에 나간 사람의 정보를 입력 해준다.
            }
            else {
                socket.to(roomId).emit('exit', {
                    chat: req.session.color + "\uB2D8\uC774 \uD1F4\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.",
                    user: 'system',
                });
            }
        });
    });
});
