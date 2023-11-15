import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { emitter } from '../../game/scenes/constants';
import { socketState, userListState } from '@/states';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Socket } from 'socket.io-client';

interface UserInterface {
  id: string;
  stream: MediaStream;
}

// todo: socket & users 전역상태로 분리
// 영상, 소리 끄기 기능 추가
function MultiVideo() {
  const [socket, setSocket] = useRecoilState(socketState);
  // const socket = useRecoilValue(socketState).socket;
  const nicknameRef = useRef<string>(useRecoilValue(socketState).nickname);
  const myVideoRef = useRef<HTMLVideoElement>(null);

  // const socket = useRecoilValue(socketState);
  const [users, setUsers] = useRecoilState(userListState);
  const roomName = 10;
  let pcs: { [socketID: string]: RTCPeerConnection }; // peerConnection 집합

  const createPeerConnection = (
    socketID: string,
    socketNickname: string,
    newSocket: Socket,
    localStream: MediaStream,
  ): RTCPeerConnection => {
    let pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // add pc to peerConnections object
    pcs = { ...pcs, [socketID]: pc };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('onicecandidate');
        newSocket.emit('candidate', {
          candidate: e.candidate,
          candidateSendID: newSocket.id,
          candidateReceiveID: socketID,
        });
      }
    };

    pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    };

    pc.ontrack = (e) => {
      console.log('ontrack success');
      emitter.emit('otherPlayer', socketNickname);
      // setUsers((oldUsers) => oldUsers.filter((user) => user.id !== socketID));
      setUsers((oldUsers) => [
        ...oldUsers,
        {
          id: socketID,
          nickname: socketNickname,
          stream: e.streams[0],
        },
      ]);
    };

    if (localStream) {
      console.log('localstream add');
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    } else {
      console.log('no local stream');
    }

    // return pc
    return pc;
  };

  useEffect(() => {
    let localStream: MediaStream;

    socket.socket.on('all_users', (allUsers: Array<{ id: string; nickname: string }>) => {
      let len = allUsers.length;

      for (let i = 0; i < len; i++) {
        createPeerConnection(allUsers[i].id, allUsers[i].nickname, socket.socket, localStream);
        let pc: RTCPeerConnection = pcs[allUsers[i].id];
        if (pc) {
          pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
            .then((sdp) => {
              console.log('create offer success');
              pc.setLocalDescription(new RTCSessionDescription(sdp));
              socket.socket.emit('offer', {
                sdp: sdp,
                offerSendID: socket.socket.id,
                offerReceiveID: allUsers[i].id,
                offerSendNickname: nicknameRef.current,
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    });

    socket.socket.on(
      'getOffer',
      (data: { sdp: RTCSessionDescription; offerSendID: string; offerSendNickname: string }) => {
        console.log('get offer', data.offerSendNickname);
        createPeerConnection(data.offerSendID, data.offerSendNickname, socket.socket, localStream);
        let pc: RTCPeerConnection = pcs[data.offerSendID];
        if (pc) {
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
            console.log('answer set remote description success');
            pc.createAnswer({
              offerToReceiveVideo: true,
              offerToReceiveAudio: true,
            })
              .then((sdp) => {
                console.log('create answer success');
                pc.setLocalDescription(new RTCSessionDescription(sdp));
                socket.socket.emit('answer', {
                  sdp: sdp,
                  answerSendID: socket.socket.id,
                  answerReceiveID: data.offerSendID,
                });
              })
              .catch((error) => {
                console.log(error);
              });
          });
        }
      },
    );

    socket.socket.on('getAnswer', (data: { sdp: RTCSessionDescription; answerSendID: string }) => {
      console.log('get answer');
      let pc: RTCPeerConnection = pcs[data.answerSendID];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
      //console.log(sdp);
    });

    socket.socket.on('getCandidate', (data: { candidate: RTCIceCandidateInit; candidateSendID: string }) => {
      console.log('get candidate');
      let pc: RTCPeerConnection = pcs[data.candidateSendID];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate)).then(() => {
          console.log('candidate add success');
        });
      }
    });

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        localStream = stream;

        console.log('join_room');
        setSocket((oldSocket) => {
          return { ...oldSocket, isReady: true };
        });

        socket.socket.emit('join_room', { room: roomName, nickname: nicknameRef.current });
      })
      .catch((error) => {
        console.log(`getUserMedia error: ${error}`);
      });

    socket.socket.on('user_exit', (data: { id: string }) => {
      pcs[data.id].close();
      delete pcs[data.id];
      setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.id));
    });
  }, []);

  return (
    <VideoContainer>
      <OtherVideoContainer>
        <video style={{ width: 240, height: 240 }} ref={myVideoRef} autoPlay />
        <span>{nicknameRef.current}</span>
      </OtherVideoContainer>
      {users.map((user) => (
        <OtherVideo key={user.id} id={user.nickname} stream={user.stream} />
      ))}
    </VideoContainer>
  );
}

const OtherVideo = ({ id, stream }: UserInterface) => {
  const ref = useRef<HTMLVideoElement>(null);
  if (stream) console.log(stream);
  else console.log('no');

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, []);

  return (
    <OtherVideoContainer>
      <video style={{ width: 240, height: 240 }} ref={ref} autoPlay />
      <span>{id}</span>
    </OtherVideoContainer>
  );
};

export default MultiVideo;

const VideoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const OtherVideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
