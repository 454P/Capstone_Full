import { useEffect, useRef } from 'react';
import config from '@/game/config';
import Phaser from 'phaser';

function GamePage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const game = new Phaser.Game({ ...config, parent: ref.current });

    return () => {
      game.destroy(true);
    };
  }, []);
  return <div ref={ref} />;
}

export default GamePage;
