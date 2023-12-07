import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import gameConfig from '@/game/gameConfig';
import { emitter } from '@/game/scenes/constants';
import { socketState } from '@/states';
import Phaser from 'phaser';
import { useRecoilState, useRecoilValue } from 'recoil';

function GamePage() {
  const ref = useRef<HTMLDivElement>(null);
  const [mySocket, setMySocket] = useRecoilState(socketState);
  const navigate = useNavigate();

  useEffect(() => {
    emitter.on('init game', () => {
      emitter.emit('send socket info', mySocket);
    });

    emitter.on('EndGame', (score: number) => {
      console.log(score);
      setMySocket((old) => {
        const newSocket = { ...old, score: score };

        return newSocket;
      });
      navigate('/town');
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
