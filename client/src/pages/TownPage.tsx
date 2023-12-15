import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import config from '@/game/config';
import { emitter } from '@/game/scenes/constants';
import { socketState } from '@/states';
import { useRecoilState, useRecoilValue } from 'recoil';
import Chat from '@/components/Chat/Chat';
import MultiVideo from '@/components/Video/MultiVideo';
import { Button, Typography } from '@/components/common';

function TownPage() {
  const ref = useRef<HTMLDivElement>(null);
  // const mySocket = useRecoilValue(socketState);
  const mySocket = useRecoilValue(socketState);
  const [isVideo, setIsVideo] = useState(true);
  const [isChat, setIsChat] = useState(true);
  const [isScore, setIsScore] = useState(true);
  const [score, setScore] = useState(mySocket.score);

  const navigate = useNavigate();

  useEffect(() => {
    if (!mySocket.isReady) {
      console.log(mySocket);
      return;
    }

    emitter.on('init', () => {
      console.log(mySocket);
      emitter.emit('initPlayer', mySocket);
    });

    emitter.on('start quiz', () => {
      console.log('start quiz');
      setIsVideo(false);
      setIsChat(false);
      setIsScore(false);
    });

    emitter.on('init game', () => {
      emitter.emit('send socket info', mySocket);
    });

    emitter.on('end quiz', (nowScore: number) => {
      console.log('end quiz');
      console.log(nowScore);
      setIsVideo(true);
      setIsChat(true);
      setIsScore(true);
      // setScore(nowScore);
    });

    emitter.on('start review', () => {
      console.log('start review');
      navigate('/review');
    });

    if (!ref.current) return;

    const game = new Phaser.Game({
      ...config,
      parent: ref.current,
    });

    return () => {
      console.log('destroy');
      mySocket.socket.emit('user_exit');
      mySocket.socket.disconnect();
      emitter.removeAllListeners();
      game.destroy(true);
    };
  }, [mySocket]);

  return (
    <TownContainer>
      {isVideo && <MultiVideo />}
      <div ref={ref} />
      {isScore && (
        <ScoreButton color='white' size='small'>
          <Typography color='brown1' font='Bold20'>
            {score}
          </Typography>
        </ScoreButton>
      )}
      {isChat && <Chat />}
    </TownContainer>
  );
}

export default TownPage;

const TownContainer = styled.div`
  display: flex;
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const ScoreButton = styled(Button)`
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
`;
