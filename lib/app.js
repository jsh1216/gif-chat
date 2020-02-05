"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var morgan_1 = __importDefault(require("morgan"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var express_session_1 = __importDefault(require("express-session"));
var connect_flash_1 = __importDefault(require("connect-flash"));
var dotenv_1 = __importDefault(require("dotenv"));
var color_hash_1 = __importDefault(require("color-hash"));
var socket_1 = __importDefault(require("./socket"));
var routes_1 = __importDefault(require("./routes"));
var schemas_1 = __importDefault(require("./schemas"));
var app = express_1.default();
schemas_1.default();
dotenv_1.default.config({ path: path_1.default.join(__dirname, '.env') });
var sessionMiddleware = express_session_1.default({
    cookie: {
        httpOnly: true,
        secure: false,
    },
    resave: false,
    saveUninitialized: false,
    secret: (_a = process.env.COOKIE_SECRET, (_a !== null && _a !== void 0 ? _a : '')),
});
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', 8005);
app.use(morgan_1.default('dev'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
console.log(path_1.default.join(__dirname, 'uploads'));
app.use('/gif', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(connect_flash_1.default());
app.use(function (req, res, next) {
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
            //이벤트 없음
        }
        else {
            var colorHash = new color_hash_1.default();
            if (req.sessionID) {
                req.session.color = colorHash.hex(req.sessionID); //세션 아이디로 컬러를 바꿀 수 있다
            }
        }
    }
    next();
});
app.use('/', routes_1.default);
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res, _next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});
var server = app.listen(app.get('port'), function () {
    console.log(app.get('port'), '번 포트에서 대기중');
});
socket_1.default(server, app, sessionMiddleware);
