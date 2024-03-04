import express from "express";
const expressServer = express();
import http from "http";
import path from "path";
import fs from "fs";
import cors from "cors";
import { Server, Socket } from "socket.io";

const initServer = http.createServer(expressServer);
const SocketIo = new Server(initServer);
const rawData = fs.readFileSync("messages.json");
const messageData = JSON.parse(rawData as any);
let users: any[] = [];

expressServer.use(cors());
SocketIo.on("connection", (socket) => {
  console.log(`${socket.id} user just connected`);

  socket.on("message", (data: any) => {
    messageData["messages"].push(data);
    const stringData = JSON.stringify(messageData, null, 2);
    fs.writeFile("messages.json", stringData, (err) => {
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
