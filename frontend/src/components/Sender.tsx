import React, { useEffect, useState } from 'react'

const Sender = () => {

    const [socket , setSocket] = useState<null | WebSocket>(null);

    //tell the sender i am the sender

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8082');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type : "sender"
            }));
        }
    },[]);

    const StartSendingVideo = async () => {
        if(!socket){
            return;
        }
        //rtc logic to start video >>
        //create rtc peer conncection
        const pc = new RTCPeerConnection();
        //create an offer
        const offer = await pc.createOffer(); //sdp
        //localdescription as the offer>
        await pc.setLocalDescription(offer);
        //send the spd to the signaling server>
        //the signaling server recognises that the sdp is coming from an create offer then it
        //transfers the sdp to the another browser/client
        socket?.send(JSON.stringify({
            type : "create-offer",
            sdp : offer
        }));
        //when the receiver sends the sdp with an asnwer we have to receive it 
        socket.onmessage = async (event) => {
            const message = await JSON.parse(event.data);
            if(message.type === 'create-answer'){
                //set the remote desciption of that answetr that came
                pc.setRemoteDescription(message.sdp);
            }
        }
    }

  return (
    <div>
        Sender
        <button onClick={StartSendingVideo}>Start Video</button>
    </div>
  )
}

export default Sender