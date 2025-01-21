import React, { useEffect } from 'react'

const Receiver = () => {

    //tell the server we are thre receiver
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8082');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type : "receiver"
            }));
        }
        //now the receiver side will receive the sdp from the sender and create an answer
        //and send it to the signalking server
        //the signaling serer recognises and forwards the sdp to the sender 
        //and hence peer conncection between the 2 clients will be made
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if(message.type === 'create-offer'){
                //establish rtc peer conn>
                const pc = new RTCPeerConnection();
                //set the remote description of the sdp that came
                pc.setRemoteDescription(message.sdp);
                //create an answer
                const answer = await pc.createAnswer();
                //set loacldescription of the answer
                await pc.setLocalDescription(answer);
                //send the answer to the signaling server>
                socket?.send(JSON.stringify({
                    type : "create-answer",
                    sdp : answer
                }))
            }
        }
    },[]);

    return (
        <div>
            Receiver
        </div>
    )
}

export default Receiver