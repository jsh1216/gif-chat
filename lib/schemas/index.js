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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var _a = process.env, MONGO_ID = _a.MONGO_ID, MONGO_PASSWORD = _a.MONGO_PASSWORD, NODE_ENV = _a.NODE_ENV;
var MONGO_URL = "mongodb://root:1234@localhost:27017/admin";
exports.default = (function () { return __awaiter(void 0, void 0, void 0, function () {
    var connect;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connect = function () {
                    if (NODE_ENV !== 'production') {
                        mongoose_1.default.set('debug', true);
                    }
                    mongoose_1.default.connect(MONGO_URL, {
                        dbName: 'gifchat',
                    }, function (error) {
                        if (error) {
                            console.log('몽고디비 연결 에러', error);
                        }
                        else {
                            console.log('몽고디비 연결 성공');
                        }
                    });
                };
                connect();
                mongoose_1.default.connection.on('error', function (error) {
                    console.error('몽고디비 연결 에러', error);
                });
                mongoose_1.default.connection.on('disconnected', function () {
                    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
                    connect();
                });
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./chat')); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./room')); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
