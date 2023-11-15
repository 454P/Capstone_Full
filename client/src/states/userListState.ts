import { atom } from 'recoil';

interface UserInterface {
  id: string;
  nickname: string;
  stream: MediaStream;
}

export const userListState = atom<UserInterface[]>({
  key: 'userListState',
  default: [],
  dangerouslyAllowMutability: true,
});
