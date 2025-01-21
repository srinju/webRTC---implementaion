

//signaling server >>

import { WebSocketServer , WebSocket } from "ws";

//the signaling server send sdp files from the sender to the receiver and vice versa

//the sdp contians 3 things >
//create offer
//create answer
//add ice candidates


const wss = new WebSocketServer({port : 8082});

let senderSocket: any = null;
let receiverSocket: any = null;

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data: any) {
        const message = JSON.parse(data);
        console.log(message);

        if(message.type === 'sender') {
            senderSocket = ws;
            console.log('sender set');
        } else if(message.type === 'receiver') {
            receiverSocket = ws;
            console.log('receiver set');
        } else if(message.type === 'create-offer') {
            console.log("offer received by the receiver");
            receiverSocket?.send(JSON.stringify({
                type: 'create-offer',
                sdp: message.sdp
            }));
        } else if(message.type === 'create-answer') {
            senderSocket?.send(JSON.stringify({
                type: "create-answer",
                sdp: message.sdp
            }));
            console.log("answer received by the sender");
        } else if(message.type === 'iceCandidate') {
            // Fixed: Send candidate instead of sdp
            if(message.from === 'sender') {
                receiverSocket?.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.candidate
                }));
            } else if(message.from === 'receiver') {
                senderSocket?.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: message.candidate
                }));
            }
        }     
    });
});