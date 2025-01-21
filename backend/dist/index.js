"use strict";
//signaling server >>
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
//the signaling server send sdp files from the sender to the receiver and vice versa
//the sdp contians 3 things >
//create offer
//create answer
//add ice candidates
const wss = new ws_1.WebSocketServer({ port: 8082 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        console.log(message);
        if (message.type === 'sender') {
            senderSocket = ws;
            console.log('sender set');
        }
        else if (message.type === 'receiver') {
            receiverSocket = ws;
            console.log('receiver set');
        }
        else if (message.type === 'create-offer') {
            console.log("offer received by the receiver");
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({
                type: 'create-offer',
                sdp: message.sdp
            }));
        }
        else if (message.type === 'create-answer') {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({
                type: "create-answer",
                sdp: message.sdp
            }));
            console.log("answer received by ther sendeer");
        }
        else if (message.type === 'iceCandidate') {
            if (senderSocket) {
                receiverSocket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.candidate
                }));
            }
            else if (receiverSocket) {
                senderSocket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.candidate
                }));
            }
        }
    });
});
