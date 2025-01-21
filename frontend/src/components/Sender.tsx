import React, { useEffect, useRef, useState } from 'react'

const Sender = () => {

    //the sender basically gets the ice candidate from the stun server sends it to the 
    //signaling server to forward it to the receiver
    //then creates an offer ,sets the local desc and sends it to the signaling server for the receiver
    //and when gets answer from the receiver 
    // it sets the remote desc
    //and also upon receiving ice candidates from the receiver it adds the ice candidates

    //and then get the video stream and send it throgh the connection

    const [socket, setSocket] = useState<null | WebSocket>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8082');
        setSocket(socket);  
        
        socket.onopen = () => {
            console.log("WebSocket Connected");
            socket.send(JSON.stringify({
                type: "sender"
            }));
        }
        
        socket.onerror = (error) => {
            console.error("WebSocket error ", error);
        }

        return () => {
            if (socket) {
                socket.close();
            }
            if (pc) {
                pc.close();
            }
        };
    },[]); 

    const StartSendingVideo = async () => {
        try {
            if(!socket) {
                alert("WebSocket not connected!");
                return;
            }
            
            console.log("Creating peer connection...");
            //create a peer connection
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });
            setPc(peerConnection);

            // Log connection state changes
            peerConnection.onconnectionstatechange = () => {
                console.log("Connection state:", peerConnection.connectionState);
            };

            peerConnection.oniceconnectionstatechange = () => {
                console.log("ICE Connection state:", peerConnection.iceConnectionState);
            };

            peerConnection.onnegotiationneeded = async () => {
                console.log("Creating offer...");
                try {
                    //create offer
                    const offer = await peerConnection.createOffer();
                    //setLocaaldesctiption of the created offer
                    await peerConnection.setLocalDescription(offer);
                    //send the offer to the ws signaling server
                    socket.send(JSON.stringify({
                        type: "create-offer",
                        sdp: offer
                    }));
                } catch (error) {
                    console.error("Error creating offer:", error);
                }
            }

            //on getting ice candidates from the stun server send it to the signaling server
            //in order to excahnge ice candidates between two clients
            peerConnection.onicecandidate = (event) => {
                console.log("New ICE candidate:", event.candidate);
                if(event.candidate) {
                    socket.send(JSON.stringify({
                        type: "iceCandidate",
                        from: "sender",
                        candidate: event.candidate
                    }));
                }
            }

            socket.onmessage = async (event) => {
                const message = await JSON.parse(event.data);
                console.log("Received message:", message.type);

                if(message.type === 'create-answer') {
                    try {
                        //set remote desc of the answer created from the receiver
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
                    } catch (error) {
                        console.error("Error setting remote description:", error);
                    }
                } else if(message.type === 'iceCandidate' && message.candidate) {
                    try {
                        //add the ice candidate that the receiver sent the sender
                        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                    } catch (error) {
                        console.error("Error adding ICE candidate:", error);
                    }
                }
            }

            //get the user media
            console.log("Getting user media...");
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });

            // Add tracks to peer connection
            stream.getTracks().forEach(track => {
                console.log("Adding track:", track.kind);
                peerConnection.addTrack(track, stream);
            });

            // Display local video
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

        } catch (error) {
            console.error("Error in StartSendingVideo:", error);
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center gap-4 bg-black">
            <button 
                onClick={StartSendingVideo}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Start Video
            </button>
            <video 
                ref={videoRef}
                autoPlay 
                playsInline
                //muted
                className="w-[640px] h-[480px] bg-black"
            />
        </div>
    )
}

export default Sender