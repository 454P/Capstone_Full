import { Loading } from './scenes';
import { Game, Town } from './scenes';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: true,
  // width: window.innerWidth,
  // height: window.innerHeight,
  width: 960,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      debug: process.env.DEBUG === 'true',
    },
  },
  autoFocus: true,
  scene: [Loading, Game, Town],
};

export default config;
