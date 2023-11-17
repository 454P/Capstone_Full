import { useEffect, useRef } from 'react';
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
  return <div ref={ref} />;
}

export default GamePage;
