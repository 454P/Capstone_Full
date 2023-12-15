import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { socketState } from '@/states';
import { useRecoilValue } from 'recoil';

interface chatting {
  nickname: string;
  content: string;
  isMyChat: boolean;
}

const Chat = () => {
  const socket = useRecoilValue(socketState).socket;
  const nickname = useRecoilValue(socketState).nickname;
  const [chatList, setChatList] = useState<chatting[]>([]);
  const [text, setText] = useState('');

  const handleChangeInput: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
  };

  const handleClickButton: MouseEventHandler<HTMLButtonElement> = (e) => {
    setChatList([...chatList, { nickname: '', content: text, isMyChat: true }]);
    setText('');
    socket.emit('message', { text: text, id: socket.id, nickname: nickname });
  };

  useEffect(() => {
    socket.on('broadcast message', (data) => {
      setChatList((old) => [...old, { nickname: data.nickname, content: data.text, isMyChat: false }]);
    });
  }, []);

  return (
    <ChatContainer>
      <TextContainer>
        {chatList &&
          chatList.map((item, idx) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} key={item.content + idx}>
              {!item.isMyChat && <span>{item.nickname}</span>}
              <StyledText isRight={item.isMyChat}>{item.content}</StyledText>
            </div>
          ))}
      </TextContainer>
      <InputContainer>
        <StyledTextArea placeholder='text here!' value={text} onChange={handleChangeInput} />
        <StyledButton onClick={handleClickButton}>확인</StyledButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  width: 320px;
  height: 640px;
  background-color: aliceblue;
  padding: 10px 10px 10px 10px;

  position: absolute;
  right: 0px;
  bottom: 0px;
  z-index: 1;
`;

const TextContainer = styled.div`
  height: 550px;
  overflow: scroll;
`;

const StyledText = styled.span<{ isRight: boolean }>`
  float: ${({ isRight }) => isRight && 'right'};
  text-align: ${({ isRight }) => isRight && 'right'};
  word-break: break-all;
  padding-bottom: 10px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledTextArea = styled.textarea`
  padding: 0 5px 0 5px;
  overflow: scroll;
  flex: 1;
`;

const StyledButton = styled.button`
  border: solid 1px;
  width: 50px;
  padding: 0 5px 0 5px;
  background-color: white;
  border-radius: 5px;
`;
