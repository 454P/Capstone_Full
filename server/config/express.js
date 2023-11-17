const express = require("express");
const compression = require("compression");
const cors = require("cors");
const { v4: uuidV4 } = require("uuid");

module.exports = function () {
    const app = express();
    const server = require("http").Server(app);
    const io = require("socket.io")(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // compression 설정
    app.use(compression());

    // cors 설정
    // app.use(cors());

    app.get("/", (req, res) => {});

    // signaling server 구현
    // 어떤 방에 어떤 유저가 들어있는지
    let users = {};
    // socket.id기준으로 어떤 방에 들어있는지
    let socketRoom = {};

    // 방의 최대 인원수
    const MAXIMUM = process.env.MAXIMUM || 4;

    io.on("connection", (socket) => {
        var client;
        const endOfLine = new TextEncoder().encode("0000000000");

        console.log(socket.id, "connection");

        socket.on("join_room", (data) => {
            // 방이 기존에 생성되어 있다면

            if (users[data.room]) {
                // 현재 입장하려는 방에 있는 인원수
                const currentRoomLength = users[data.room].length;
                if (currentRoomLength === MAXIMUM) {
                    // 인원수가 꽉 찼다면 돌아갑니다.
                    socket.to(socket.id).emit("room_full");
                    return;
                }

                // 여분의 자리가 있다면 해당 방 배열에 추가해줍니다.
                users[data.room] = [...users[data.room], { id: socket.id, nickname: data.nickname }];
            } else {
                // 방이 존재하지 않다면 값을 생성하고 추가해줍시다.
                users[data.room] = [{ id: socket.id, nickname: data.nickname }];
            }
            socketRoom[socket.id] = data.room;
            console.log(users[data.room]);

            // 입장
            console.log(`${socket.id} entered ${data.room}`);
            socket.join(data.room);

            // 입장하기 전 해당 방의 다른 유저들이 있는지 확인하고
            // 다른 유저가 있었다면 offer-answer을 위해 알려줍니다.
            const others = users[data.room].filter((user) => user.id !== socket.id);
            if (others.length) {
                io.sockets.to(socket.id).emit("all_users", others);
            }
        });

        socket.on("offer", (data) => {
            // offer를 전달받고 다른 유저들에게 전달해 줍니다.
            // socket.to(roomName).emit("getOffer", sdp);
            // offerSendID: offer을 보내는 user의 socket id
            // offerReceiveID: oofer을 받을 user의 socket id
            socket.to(data.offerReceiveID).emit("getOffer", {
                sdp: data.sdp,
                offerSendID: data.offerSendID,
                offerSendNickname: data.offerSendNickname,
            });
        });

        socket.on("answer", (data) => {
            // answer를 전달받고 방의 다른 유저들에게 전달해 줍니다.
            // socket.to(roomName).emit("getAnswer", sdp);
            // answerSendID: answer을 보내는 user의 socket id
            // answerReceiveID: answer을 받을 user의 socket id
            socket.to(data.answerReceiveID).emit("getAnswer", {
                sdp: data.sdp,
                answerSendID: data.answerSendID,
            });
        });

        socket.on("candidate", (data) => {
            // candidate를 전달받고 방의 다른 유저들에게 전달해 줍니다.
            // socket.to(roomName).emit("getCandidate", candidate);
            // candidateReceiveID: candidate를 받는 user의 socket id
            socket.to(data.candidateReceiveID).emit("getCandidate", {
                candidate: data.candidate,
                candidateSendID: data.candidateSendID,
            });
        });

        /** 채팅 */
        socket.on("message", (data) => {
            const roomID = socketRoom[socket.id];

            if (users[roomID]) {
                const usersToSend = users[roomID].filter((user) => user.id !== data.id);

                if (usersToSend) {
                    usersToSend.forEach((receiver) => {
                        socket.to(receiver.id).emit("broadcast message", {
                            text: data.text,
                            nickname: data.nickname,
                        });
                    });
                }
            }
        });

        function sendDataToOthers(data, operation) {
            const roomID = socketRoom[socket.id];
            if (users[roomID]) {
                const usersToSend = users[roomID].filter((user) => user.id !== data.id);
                if (usersToSend) {
                    usersToSend.forEach((receiver) => {
                        console.log(receiver, data);
                        socket.to(receiver.id).emit(operation, data);
                    });
                }
            }
        }

        /** 캐릭터 들어올 때 */
        socket.on("init player", (data) => {
            sendDataToOthers(data, "new player");
        });
        socket.on("move player", (data) => {
            sendDataToOthers(data, "move other player");
        });

        socket.on("inform player", (data) => {
            socket.to(data.receiver).emit("exist player", {
                id: data.id,
                x: data.x,
                y: data.y,
                direction: data.direction,
                nickname: data.nickname,
            });
        });

        /** 수어 시작!! */
        socket.on("start sign", (data) => {
            // tcp 연결
            var net = require("net");

            var options = {
                // 접속 정보 설정
                port: 8080,
                host: "49.142.76.124",
            };

            client = net.connect(options, () => {
                console.log("connected");
                const sendData = { type: 2, api: data };
                client.write(JSON.stringify(sendData));
                client.write(endOfLine);

                client.on("data", (responseData) => {
                    const response = JSON.parse(responseData.toString());
                    console.log(response);
                    socket.emit(`sign response${response.count}`, response.type);
                });
            });
        });

        socket.on("sign", (data) => {
            client.write(JSON.stringify(data));
            client.write(endOfLine);
        });

        socket.on("disconnect", () => {
            // 방을 나가게 된다면 socketRoom과 users의 정보에서 해당 유저를 지워줍니다.
            const roomID = socketRoom[socket.id];

            if (users[roomID]) {
                users[roomID] = users[roomID].filter((user) => user.id !== socket.id);
                if (users[roomID].length === 0) {
                    delete users[roomID];
                    return;
                }
            }
            delete socketRoom[socket.id];
            console.log("disconnected: ", socket.id);
            socket.to(roomID).emit("user_exit", { id: socket.id });
        });
    });

    return server;
};
