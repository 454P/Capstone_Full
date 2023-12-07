import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import config from '@/game/config';
import { emitter } from '@/game/scenes/constants';
import { socketState } from '@/states';
import { useRecoilValue } from 'recoil';
import Chat from '@/components/Chat/Chat';
import MultiVideo from '@/components/Video/MultiVideo';

function TownPage() {
  const ref = useRef<HTMLDivElement>(null);
  const mySocket = useRecoilValue(socketState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mySocket.isReady) return;

    emitter.on('init', () => {
      emitter.emit('initPlayer', mySocket);
    });

    emitter.on('start quiz', () => {
      console.log('start quiz');
      navigate('/game');
    });

    if (!ref.current) return;

    const game = new Phaser.Game({
      ...config,
      parent: ref.current,
    });

    return () => {
      emitter.removeAllListeners();
      game.destroy(true);
    };
  }, [mySocket]);

  return (
    <TownContainer>
      <MultiVideo />
      <div ref={ref} />
      <Chat />
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
