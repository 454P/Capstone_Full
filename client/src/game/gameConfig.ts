import { Game, LoadingGame } from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: true,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      debug: process.env.DEBUG === 'true',
    },
  },
  autoFocus: true,
  scene: [LoadingGame, Game],
};

export default gameConfig;
