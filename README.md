# ice candidate log format >>

{
  type: 'iceCandidate', -- icecandidat
  from: 'receiver', //from receiver that is the receiver is sending the ice candidate to the signaling sever
  candidate: {
    candidate: 'candidate:3002830482 1 udp 2122129151 172.18.141.153 59237 typ host generation 0 ufrag hRfK network-id 3 network-cost 10',
    sdpMid: '0',
    sdpMLineIndex: 0,
    usernameFragment: 'hRfK'
  }
}

udp is the protocol used herer
rtp and rtcp are video and audio transmitting protocols that are the ones webRTC uses
2122129151 is the priority of the candidaite
59237 candidates port number
typ host indicats it is from a lcoal network

sdpMid: Specifies the media stream ID this candidate is associated with. Example: "0".

sdpMLineIndex: Indicates the media description index in the SDP. Example: 0.

usernameFragment: A unique identifier (ufrag) used during the ICE negotiation to pair candidates.

# sdp logs contain hrfk or ufrag

Significance of hRfK
In your logs, hRfK is a randomly generated ufrag assigned by WebRTC for the current session.
Both sender and receiver logs include this same ufrag because they are participating in the same WebRTC session.

how the video gets to the sender side >

we take the video tracks from the sender in a class
and set all each tracks to the peer connection so that the video stream 
travels to the receiver side and the receiver side is abke to see the video

# SENDER SIDE >>

Getting User Media:

navigator.mediaDevices.getUserMedia() is used to access the user's camera and microphone.
This method returns a MediaStream object containing media tracks (one for video and one for audio in this case).
Each media track represents a specific type of media (like audio or video) captured from the user's device.
Adding Tracks to Peer Connection:

stream.getTracks() retrieves an array of the individual tracks (e.g., one for video and one for audio) from the MediaStream.
peerConnection.addTrack(track, stream) adds each track to the RTCPeerConnection. This is crucial because it establishes the mechanism for transmitting the media data to the receiver over the peer-to-peer connection.
Displaying Local Video:

The stream is set as the source (srcObject) for a <video> element using videoRef.current.srcObject = stream.
This allows the local user to see their video feed.

# RECIEVER SIDE >>

Creating a New MediaStream:

The receiver doesn't directly receive a MediaStream. Instead, the RTCPeerConnection sends individual media tracks.
mediaStreamRef.current = new MediaStream() creates an empty MediaStream object that will eventually hold the received tracks.
This MediaStream is then linked to the <video> element (videoRef.current.srcObject), which will play the video/audio.
Handling Incoming Tracks:

The ontrack event fires every time a new media track (video or audio) is received from the sender.
event.track represents the received track (e.g., video or audio).
The track is added to the local MediaStream using mediaStreamRef.current.addTrack(event.track), which effectively builds the stream piece by piece.
Displaying the Received Video:

Since mediaStreamRef.current is already set as the source for the <video> element, adding tracks automatically updates the displayed media.
The videoRef.current.play() call ensures the video starts playing.


