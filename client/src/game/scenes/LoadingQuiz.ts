import { emitter, scene } from './constants';
import Phaser from 'phaser';
import gameJson from '@/assets/board/game.json';
import flowerImg from '@/assets/objects/Flowers.png';
import treeImg from '@/assets/objects/Trees.png';
import rainParticleImg from '@/assets/particles/rain.png';
import starParticleImg from '@/assets/particles/star.png';
import fenceImg from '@/assets/tilesets/Fences.png';
import grassHillImg from '@/assets/tilesets/Grass_Hill.png';
import waterImg from '@/assets/tilesets/Water.png';

export default class LoadingGame extends Phaser.Scene {
  map?: string;
  constructor() {
    super('loadingGame');
  }

  init() {
    emitter.on('start', (data: string) => {
      console.log(data);
      this.map = data;
    });
  }

  preload() {
    this.load.image('water_tiles', waterImg);
    this.load.image('grass_hill_tiles', grassHillImg);
    this.load.image('fence_tiles', fenceImg);
    this.load.image('flower_tiles', flowerImg);
    this.load.image('tree_tiles', treeImg);

    this.load.tilemapTiledJSON('quiz', gameJson);
    // particles
    this.load.image('star-particle', starParticleImg);
    this.load.image('rain-particle', rainParticleImg);
  }

  create() {
    this.add.text(20, 20, 'loading...');
    this.scene.start(scene.quiz);
  }
}
