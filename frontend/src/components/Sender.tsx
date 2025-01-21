import React, { useEffect, useRef, useState } from 'react'

const Sender = () => {

    const [socket , setSocket] = useState<null | WebSocket>(null);
    const [pc , setPc] = useState<RTCPeerConnection | null>(null);
    

    //tell the sender i am the sender

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8082');
        setSocket(socket);  
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type : "sender"
            }));
        }
        socket.onerror = (error) => {
            console.error("websockert error  " , error);
        }
    },[]);  

    const StartSendingVideo = async () => {
        console.log("inside start sending video");
        if(!socket){
            alert("socket not found!!!");
            return;
        }
        
        //create rtc peer conncection
        const pc = new RTCPeerConnection();
        setPc(pc);

        //we will make the offer and send it to the other side whenever there is any negotiation needded>
        pc.onnegotiationneeded = async () => {
            console.log("on negotiation needed");
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

        }

        //add the ice candidate >
        //and send it to the signaling server

        pc.onicecandidate = (event) => {
            console.log("ice candidate event : " , event);
            if(event.candidate){
                socket.send(JSON.stringify({
                    type : "iceCandidate",
                    from : 'sender',
                    candidate : event.candidate
                }));
            }
        }

        //when the receiver sends the sdp with an asnwer we have to receive it 
        socket.onmessage = async (event) => {
            const message = await JSON.parse(event.data);
            if(message.type === 'create-answer'){
                //set the remote desciption of that answetr that came
                await pc.setRemoteDescription(message.sdp);
            } else if(message.type === 'iceCandidate'){
                //catch the ice candidate from the receiver>
                pc.addIceCandidate(message.candidate);
            }
        }
        //open camera for the sender to send their video >

        // Set up and display local camera stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true , audio :true });
        pc.addTrack(stream.getVideoTracks()[0]);
        //pc.addTrack(stream.getAudioTracks()[0]);
        const video = document.createElement('video');
        document.body.appendChild(video);
        video.srcObject =stream;
        video.play();
    }

  return (
    <div>
        Sender
        <button onClick={StartSendingVideo}>Start Video</button>
    </div>
  )
}

export default Sender