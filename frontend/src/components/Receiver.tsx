import React, { useEffect, useRef } from 'react'

const Receiver = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8082');
        let pc: RTCPeerConnection | null = null;

        socket.onopen = () => {
            console.log("WebSocket Connected");
            socket.send(JSON.stringify({
                type: "receiver" 
            }));
        }

        socket.onerror = (error) => {
            console.error("WebSocket error ", error);
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message.type);

            if(message.type === 'create-offer') {
                console.log("Received offer. Creating peer connection...");
                pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                });

                // Log peer connection state changes
                pc.onconnectionstatechange = () => {
                    console.log("Connection state:", pc?.connectionState);
                };

                pc.oniceconnectionstatechange = () => {
                    console.log("ICE Connection state:", pc?.iceConnectionState);
                };

                pc.onicecandidate = (event) => {
                    console.log("New ICE candidate:", event.candidate);
                    if(event.candidate) {
                        socket.send(JSON.stringify({
                            type: "iceCandidate",
                            from: "receiver",
                            candidate: event.candidate
                        }));
                    }
                }

                // Create a new MediaStream if it doesn't exist
                if (!mediaStreamRef.current) {
                    mediaStreamRef.current = new MediaStream();
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStreamRef.current;
                    }
                }

                pc.ontrack = (event) => {
                    console.log("Received track:", event.track.kind, event.track);
                    
                    if (mediaStreamRef.current) {
                        mediaStreamRef.current.addTrack(event.track);
                    }

                    // Force video element to play
                    if (videoRef.current) {
                        videoRef.current.play().catch(e => {
                            console.error("Error playing video:", e);
                        });
                    }
                };

                try {
                    console.log("Setting remote description...");
                    await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
                    console.log("Creating answer...");
                    const answer = await pc.createAnswer();
                    console.log("Setting local description...");
                    await pc.setLocalDescription(answer);
                    
                    socket.send(JSON.stringify({
                        type: "create-answer",
                        sdp: answer
                    }));
                } catch (error) {
                    console.error("Error in offer/answer process:", error);
                }
            } else if(message.type === 'iceCandidate' && message.candidate) {
                try {
                    if (pc) {
                        console.log("Adding ICE candidate");
                        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
                    }
                } catch (error) {
                    console.error("Error adding ICE candidate:", error);
                }
            }
        }

        // Cleanup function
        return () => {
            if (pc) {
                pc.close();
            }
            if (socket) {
                socket.close();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="w-full h-full flex justify-center items-center">
            <video 
                ref={videoRef}
                autoPlay 
                playsInline
                //muted // Add muted to avoid autoplay issues
                className="w-[640px] h-[480px] bg-black"
            />
        </div>
    );
}

export default Receiver;