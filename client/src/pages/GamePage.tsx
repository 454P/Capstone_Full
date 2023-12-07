import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import gameConfig from '@/game/gameConfig';
import { emitter } from '@/game/scenes/constants';
import { socketState } from '@/states';
import Phaser from 'phaser';
import { useRecoilValue } from 'recoil';

function GamePage() {
  const ref = useRef<HTMLDivElement>(null);
  const mySocket = useRecoilValue(socketState);

  useEffect(() => {
    emitter.on('init game', () => {
      emitter.emit('send socket info', mySocket);
    });

    if (!ref.current) return;
    const game = new Phaser.Game({ ...gameConfig, parent: ref.current });

    return () => {
      game.destroy(true);
    };
  }, []);
  return (
    <GameContainer>
      <div ref={ref} />
    </GameContainer>
  );
}

export default GamePage;

const GameContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: black;
`;
