import React, { useEffect, useRef,  } from 'react'

const Receiver = () => {
    //const videoRef = useRef<HTMLVideoElement>(null);
    //tell the server we are thre receiver
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8082');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type : "receiver" 
            }));
        }
        socket.onerror = (error) => {
            console.error("websockert error  " , error);
        }
        //now the receiver side will receive the sdp from the sender and create an answer
        //and send it to the signalking server
        //the signaling serer recognises and forwards the sdp to the sender 
        //and hence peer conncection between the 2 clients will be made
        socket.onmessage = async (event) => {
            //establish rtc peer conn>
            const pc = new RTCPeerConnection();
            const message = JSON.parse(event.data);

            if(message.type === 'create-offer'){
                //set the remote description of the sdp that came
                pc.setRemoteDescription(message.sdp);
                //get the ice candidate >
                pc.onicecandidate = (event) => {
                    console.log("event came to receiver ; " , event);
                    if(event.candidate){
                        socket.send(JSON.stringify({
                            type : "iceCandidate",
                            from : 'receiver',
                            candidate : event.candidate
                        }))
                    }
                }

                //get the video >
                pc.ontrack = (event) => {
                    console.log("Received track:", event.track.kind);
                    const video = document.createElement('video');
                    video.style.width = '640px';
                    video.style.height = '480px';
                    document.body.appendChild(video);
                    video.srcObject = new MediaStream([event.track]);
                    video.autoplay = true;
                    video.playsInline = true;
                }

                //create an answer
                const answer = await pc.createAnswer();
                //set loacldescription of the answer
                await pc.setLocalDescription(answer);
                //send the answer to the signaling server>
                socket?.send(JSON.stringify({
                    type : "create-answer",
                    sdp : answer
                }))
            } else if(message.type === 'iceCandidate'){
                //receive the ice candidate from the sender>
                await pc.addIceCandidate(message.candidate);
            }
            /*
            const video = document.createElement("video");
            document.body.appendChild(video);
            const mediaStream = new MediaStream();
            pc.ontrack = (event) => {
                mediaStream.addTrack(event.track);
                video.srcObject = mediaStream;
                video.play();
            };
            */
        }
    },[]);

    return (
        <div>
            Receiver
        </div>
    )
}

export default Receiver