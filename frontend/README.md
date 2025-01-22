
ice candidate log format >>

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

sdp logs contain hrfk or ufrag

Significance of hRfK
In your logs, hRfK is a randomly generated ufrag assigned by WebRTC for the current session.
Both sender and receiver logs include this same ufrag because they are participating in the same WebRTC session.