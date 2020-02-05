"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var room_1 = require("../schemas/room");
var chat_1 = require("../schemas/chat");
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var router = express_1.default.Router();
router.get('/', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var rooms, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, room_1.RoomSchema.find({})];
            case 1:
                rooms = _a.sent();
                res.render('main', {
                    error: req.flash('roomError'),
                    rooms: rooms,
                    title: 'GIF 채팅방',
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error(error_1);
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get('/room', function (req, res) {
    res.render('room', { title: 'GIF 채팅방 생성' });
});
router.post('/room', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var room, newRoom, io, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                room = new room_1.RoomSchema({
                    max: req.body.max,
                    owner: (_a = req.session) === null || _a === void 0 ? void 0 : _a.color,
                    password: req.body.password,
                    title: req.body.title,
                });
                return [4 /*yield*/, room.save()];
            case 1:
                newRoom = _b.sent();
                io = req.app.get('io');
                io.of('/room').emit('newRoom', newRoom);
                res.redirect("/room/" + newRoom._id + "?password=" + req.body.password);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error(error_2);
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get('/room/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var document_1, io, room, rooms, chats, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, room_1.RoomSchema.findOne({ _id: req.params.id })];
            case 1:
                document_1 = _b.sent();
                io = req.app.get('io');
                if (!document_1) {
                    req.flash('roomError', '존재하지 않는 방입니다.');
                    return [2 /*return*/, res.redirect('/')];
                }
                room = document_1.toObject();
                if (room.password && room.password !== req.query.password) {
                    req.flash('roomError', '비밀번호가 틀렸습니다.');
                    return [2 /*return*/, res.redirect('/')];
                }
                rooms = io.of('/chat').adapter.rooms;
                if (rooms &&
                    rooms[req.params.id] &&
                    room.max <= rooms[req.params.id].length) {
                    req.flash('roomError', '허용 인원이 초과하였습니다.');
                    return [2 /*return*/, res.redirect('/')];
                }
                console.log(room._id);
                return [4 /*yield*/, chat_1.ChatSchema.find({ room: room._id }).sort('creaatedAt')];
            case 2:
                chats = _b.sent();
                return [2 /*return*/, res.render('chat', {
                        chats: chats,
                        room: room,
                        title: room.title,
                        user: (_a = req.session) === null || _a === void 0 ? void 0 : _a.color,
                    })];
            case 3:
                error_3 = _b.sent();
                console.error(error_3);
                return [2 /*return*/, next(error_3)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.delete('/room/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, room_1.RoomSchema.remove({ _id: req.params.id })];
            case 1:
                _a.sent();
                return [4 /*yield*/, chat_1.ChatSchema.remove({ room: req.params.id })];
            case 2:
                _a.sent();
                res.send('ok');
                setTimeout(function () {
                    req.app
                        .get('io')
                        .of('/room')
                        .emit('removeRoom', req.params.id);
                }, 2000);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error(error_4);
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/room/:id/chat', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var chat, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                chat = new chat_1.ChatSchema({
                    chat: req.body.chat,
                    room: req.params.id,
                    user: (_a = req.session) === null || _a === void 0 ? void 0 : _a.color,
                });
                return [4 /*yield*/, chat.save()];
            case 1:
                _b.sent();
                req.app
                    .get('io')
                    .of('/chat')
                    .to(req.params.id)
                    .emit('chat', chat);
                res.send('ok');
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                console.error(error_5);
                next(error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
fs_1.default.readdir('lib/uploads', function (error) {
    if (error) {
        console.error('uploads 폴더가 없어서 uploads 폴더를 생성 합니다.');
        fs_1.default.mkdirSync('lib/uploads');
    }
});
var upload = multer_1.default({
    limits: { fileSize: 5 * 1024 * 1024 },
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'lib/uploads/');
        },
        filename: function (req, file, cb) {
            var ext = path_1.default.extname(file.originalname);
            cb(null, path_1.default.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),
});
router.post('/room/:id/gif', upload.single('gif'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var chat, error_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                chat = new chat_1.ChatSchema({
                    gif: req.file.filename,
                    room: req.params.id,
                    user: (_a = req.session) === null || _a === void 0 ? void 0 : _a.color,
                });
                return [4 /*yield*/, chat.save()];
            case 1:
                _b.sent();
                req.app
                    .get('io')
                    .of('/chat')
                    .to(req.params.id)
                    .emit('chat', chat);
                res.send('ok');
                return [3 /*break*/, 3];
            case 2:
                error_6 = _b.sent();
                console.error(error_6);
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
