import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';

const Video = () => {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket>();
  const [pc, setPC] = useState<RTCPeerConnection>();

  const roomName = 10;
  let newPC = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  const createOffer = async () => {
    if (!socketRef.current) return;

    try {
      const sdp = await newPC.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
      console.log('create offer');
      newPC.setLocalDescription(new RTCSessionDescription(sdp));

      console.log('sent offer');
      socketRef.current.emit('offer', sdp, roomName);
    } catch (e) {
      console.log(e);
    }
  };

  const createAnswer = (sdp: RTCSessionDescription) => {
    newPC
      .setRemoteDescription(new RTCSessionDescription(sdp))
      .then(() => {
        console.log('answer set remote description success');
        newPC
          .createAnswer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
          .then((sdp1) => {
            console.log('create answer');
            newPC.setLocalDescription(new RTCSessionDescription(sdp1));
            socketRef.current?.emit('answer', sdp1, roomName);
          })
          .catch((err) => console.log(err));
      })
      .catch((e) => console.log(e));
  };

  const getMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        stream.getTracks().forEach((track) => newPC.addTrack(track, stream));
        newPC.onicecandidate = (e) => {
          if (e.candidate) {
            console.log('onicecandidate');
            socketRef.current?.emit('candidate', e.candidate, roomName);
          }
        };

        newPC.oniceconnectionstatechange = (e) => console.log(e);
        newPC.ontrack = (ev) => {
          console.log('add remotetrack success');
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = ev.streams[0];
        };

        if (socketRef.current) {
          console.log('join room');
          socketRef.current.emit('join_room', { room: roomName });
        }
      })
      .catch((err) => console.log(`get user media error : ${err}`));
  };

  useEffect(() => {
    socketRef.current = io('http://localhost:45491');
    socketRef.current.on('all_users', (others: Array<{ id: string }>) => {
      if (others.length > 0) createOffer();
    });

    socketRef.current.on('getOffer', (sdp: RTCSessionDescription) => {
      console.log('get offer');
      createAnswer(sdp);
    });

    socketRef.current.on('getAnswer', (sdp: RTCSessionDescription) => {
      console.log('get answer');
      newPC.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketRef.current.on('getCandidate', (candidate: RTCIceCandidateInit) => {
      console.log(candidate);
      newPC
        .addIceCandidate(new RTCIceCandidate(candidate))
        .then(() => console.log('candidate add success'))
        .catch((err) => console.log(err));
    });

    getMedia();

    setPC(newPC);
  }, []);

  return (
    <div>
      <video
        id='remotevideo'
        style={{
          width: 240,
          height: 240,
          backgroundColor: 'black',
        }}
        ref={myVideoRef}
        autoPlay
      />

      <video
        id='remotevideo'
        style={{
          width: 240,
          height: 240,
          backgroundColor: 'yellow',
        }}
        ref={remoteVideoRef}
        autoPlay
      />
    </div>
  );
};

export default Video;
