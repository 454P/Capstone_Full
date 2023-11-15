import { atom } from 'recoil';
import { Socket, io } from 'socket.io-client';

interface customSocket {
  nickname: string;
  socket: Socket;
  isReady: boolean;
}

export const socketState = atom<customSocket>({
  key: 'socketState',
  default: {
    nickname: `${String(Math.floor(Math.random() * 1000))}`,
    socket: io('http://localhost:8080'),
    isReady: false,
  },
  dangerouslyAllowMutability: true,
});
