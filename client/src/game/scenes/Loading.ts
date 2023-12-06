import { scene } from './constants';
import Phaser from 'phaser';
import townJson from '@/assets/board/background.json';
import gameJson from '@/assets/board/game.json';
import chickenJson from '@/assets/character/chicken.json';
import chickenImg from '@/assets/character/chicken.png';
import characterJson from '@/assets/character/sprites.json';
import characterImg from '@/assets/character/spritesheet.png';
import flowerImg from '@/assets/objects/Flowers.png';
import treeImg from '@/assets/objects/Trees.png';
import rainParticleImg from '@/assets/particles/rain.png';
import starParticleImg from '@/assets/particles/star.png';
import fenceImg from '@/assets/tilesets/Fences.png';
import grassImg from '@/assets/tilesets/Grass.png';
import grassHillImg from '@/assets/tilesets/Grass_Hiil.png';
import waterImg from '@/assets/tilesets/Water.png';

export default class Loading extends Phaser.Scene {
  constructor() {
    super(scene.loading);
  }

  preload() {
    this.load.image('water_tiles', waterImg);
    this.load.image('grass_tiles', grassImg);
    this.load.image('grass_hill_tiles', grassHillImg);
    this.load.image('fence_tiles', fenceImg);
    this.load.image('flower_tiles', flowerImg);
    this.load.image('tree_tiles', treeImg);

    this.load.atlas('character', characterImg, characterJson);
    this.load.atlas('chicken', chickenImg, chickenJson);

    this.load.tilemapTiledJSON('map', townJson);
    this.load.tilemapTiledJSON('game', gameJson);

    this.load.image('star-particle', starParticleImg);
    this.load.image('rain-particle', rainParticleImg);
  }
  create() {
    this.add.text(20, 20, 'loading...');
    this.scene.start(scene.town);
  }
}
