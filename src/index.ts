

//signaling server >>

import { error } from "console";
import { WebSocketServer , WebSocket } from "ws";

//the signaling server send sdp files from the sender to the receiver and vice versa

//the sdp contians 3 things >
//create offer
//create answer
//add ice candidates

const wss = new WebSocketServer({port : 8082});

let senderSocket : any = null;
let receiverSocket : any = null;

wss.on('connection' , function connection(ws) {

    ws.on('message' , function message(data : any) {
        const message = JSON.parse(data);
        console.log(message);

        if(message.type === 'sender'){
            senderSocket = ws;
        } else if(message.type === 'receiver'){
            receiverSocket = ws;
        } else if(message.type === 'create-offer'){
            receiverSocket?.send(JSON.stringify({
                type : 'createOffer',
                sdp : message.sdp
            }));
        } else if(message.type === 'create-answer'){
            senderSocket?.send(JSON.stringify({
                type : "createAnswer",
                sdp : message.sdp
            }));
        } else if(message.type === 'iceCandidate'){
            if(senderSocket){
                receiverSocket.send(JSON.stringify({
                    type : "ice candidate",
                    sdp : message.sdp
                }));
            } else if(receiverSocket){
                senderSocket.send(JSON.stringify({
                    type : "ice candidate",
                    sdp : message.spd
                }));
            }
        }
           
    });
});