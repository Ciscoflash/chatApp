"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expressServer = (0, express_1.default)();
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const initServer = http_1.default.createServer(expressServer);
const SocketIo = new socket_io_1.Server(initServer);
const rawData = fs_1.default.readFileSync("messages.json");
const messageData = JSON.parse(rawData);
let users = [];
expressServer.use((0, cors_1.default)());
SocketIo.on("connection", (socket) => {
    console.log(`${socket.id} user just connected`);
    socket.on("message", (data) => {
        messageData["messages"].push(data);
        const stringData = JSON.stringify(messageData, null, 2);
        fs_1.default.writeFile("messages.json", stringData, (err) => {
            console.log(err);
        });
        SocketIo.emit("messageResponse", messageData);
    });
    socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));
    socket.on("newUser", (data) => {
        users.push(data);
        SocketIo.emit("newUserResponse", users);
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected");
        users = users.filter((user) => user.socketID !== socket.id);
        SocketIo.emit("newUserResponse", users); // Fix the event name here
        socket.disconnect();
    });
});
expressServer.get("/", (req, res) => {
    res.json(messageData);
});
initServer.listen(5000, () => {
    console.log(`App is listening on port ${5000}`);
});
