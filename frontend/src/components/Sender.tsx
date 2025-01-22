import React, { useEffect, useRef, useState } from 'react'

const Sender = () => {
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
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    socket.send(JSON.stringify({
                        type: "create-offer",
                        sdp: offer
                    }));
                } catch (error) {
                    console.error("Error creating offer:", error);
                }
            }

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
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
                    } catch (error) {
                        console.error("Error setting remote description:", error);
                    }
                } else if(message.type === 'iceCandidate' && message.candidate) {
                    try {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                    } catch (error) {
                        console.error("Error adding ICE candidate:", error);
                    }
                }
            }

            console.log("Getting user media...");
            //the browser accesses the user camera and microphone 
            //a mediaStream object is created , which contains multiple media stream tracks one for audio and one for video
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });

            // Add tracks to peer connection
            //each track is added to the rtc peer connection so it gets transmitted to the receiver side over the p2p conn
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
        <div className="w-full h-full flex flex-col items-center gap-4">
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