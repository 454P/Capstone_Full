import { LoadingQuiz, Quiz } from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: true,
  width: 1280,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      debug: process.env.DEBUG === 'true',
    },
  },
  autoFocus: true,
  scene: [LoadingQuiz, Quiz],
};

export default gameConfig;
