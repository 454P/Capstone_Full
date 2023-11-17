import NPC from '../players/NPC';
import OtherPlayer from '../players/OtherPlayer';
import Player from '../players/Player';
import { PlayerInfo, spriteInfo, spriteInfoInterface } from '../players/constants';
import { emitter, scene } from './constants';
import axios from 'axios';
import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

// type 분리
interface customSocket {
  nickname: string;
  socket: Socket;
  apiKey: string;
}

interface otherPlayerInfo {
  socketId: string;
  sprite: Phaser.Physics.Arcade.Sprite;
}

export default class Town extends Phaser.Scene {
  townLayer?: Phaser.Tilemaps.TilemapLayer;
  player?: Phaser.Physics.Arcade.Sprite;
  otherPlayers: otherPlayerInfo[];
  socket?: Socket;
  nickname?: string;
  npc?: Phaser.Physics.Arcade.Sprite;
  isOverlap: boolean;
  interaction?: Phaser.GameObjects.Text;
  conversation: string;
  nextButton?: Phaser.GameObjects.Text;
  closeButton?: Phaser.GameObjects.Text;
  quizButton?: Phaser.GameObjects.Text;
  bubble?: Phaser.GameObjects.Graphics;
  apiKey?: string;

  constructor() {
    super(scene.town);
    this.otherPlayers = [];
    this.isOverlap = false;
    this.conversation = '';
  }

  init() {
    if (!this.socket) {
      emitter.on('initPlayer', (mySocket: customSocket) => {
        console.log(mySocket);
        this.socket = mySocket.socket;
        this.nickname = mySocket.nickname;
        this.apiKey = mySocket.apiKey;
      });
    }
    emitter.emit('init');
    this.socketConnection();
  }

  create() {
    // background
    const map = this.make.tilemap({ key: 'map' });

    const grass = map.addTilesetImage('Grass', 'grass_tiles');
    const water = map.addTilesetImage('Water', 'water_tiles');

    const waterLayer = water && map.createLayer('Water', water, 0, 0);
    const landLayer = grass && map.createLayer('Land', grass, 0, 0);

    //player
    spriteInfo.forEach((info: spriteInfoInterface) => {
      const { action, start, end } = info;

      this.anims.create({
        key: action,
        frames: this.anims.generateFrameNames('character', {
          prefix: 'sprite',
          start,
          end,
        }),
        frameRate: 4,
        repeat: -1,
      });
    });

    if (this.nickname && this.socket) {
      this.player = new Player(
        this,
        Math.floor(Math.random() * 500),
        Math.floor(Math.random() * 500),
        this.nickname,
        this.socket,
      );
    }

    // NPC
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNames('chicken', { prefix: 'sprite', start: 1, end: 10 }),
      frameRate: 4,
      repeat: -1,
    });
    this.npc = new NPC(this, 100, 100, 'npc1');
    this.physics.add.group(this.npc);
    this.physics.add.group(this.player);
    this.physics.add.group(this.interaction);
    this.interaction = this.add.text(0, 0, this.conversation);
    this.nextButton = this.add.text(0, 0, '');
    this.nextButton.setVisible(false);
    this.closeButton = this.add.text(0, 0, '');
    this.closeButton.setVisible(false);
    this.quizButton = this.add.text(300, 300, 'START QUIZ').setInteractive().on('pointerdown', this.startQuiz, this);
    this.player && this.physics.add.overlap(this.npc, this.player, this.npcInteraction, undefined, this);
  }

  startQuiz() {
    emitter.emit('start quiz');
  }

  async startSignLanguage() {
    console.log('clicked');

    this.socket?.emit('sign', { api: this.apiKey, word: '이거', type: 2, count: 1 });
    this.socket?.on('sign response1', (data: number) => {
      console.log(data);
      if (data) this.interaction?.setText('  O');
      else this.interaction?.setText('  X');
    });
  }

  npcInteraction() {
    if (!this.isOverlap) {
      this.isOverlap = true;
      this.createSpeechBubble(70, 400, 250, 100, '안녕하세요.');
    }
  }

  update() {
    this.player?.update();
  }

  socketConnection() {
    this.socket?.on('new player', (data: PlayerInfo) => {
      console.log('new player: ', data);
      this.otherPlayers?.push({
        socketId: data.id,
        sprite: new OtherPlayer(this, data.x, data.y, data.nickname, data.id, data.direction),
      });

      this.socket?.emit('inform player', {
        receiver: data.id,
        id: this.socket.id,
        x: this.player?.x,
        y: this.player?.y,
        direction: 'front',
        nickname: this.nickname,
      });
    });

    this.socket?.on('exist player', (data: PlayerInfo) => {
      console.log('new player: ', data);
      this.otherPlayers?.push({
        socketId: data.id,
        sprite: new OtherPlayer(this, data.x, data.y, data.nickname, data.id, data.direction),
      });
    });

    this.socket?.on('move other player', (data) => {
      if (data) {
        this.otherPlayers.forEach((otherPlayer) => {
          if (otherPlayer.socketId === data.id) otherPlayer.sprite.update(data.x, data.y, data.direction);
        });
      }
    });
  }

  createSpeechBubble(x: number, y: number, width: number, height: number, quote: string) {
    const bubbleWidth = width;
    const bubbleHeight = height;
    const bubblePadding = 10;
    const arrowHeight = bubbleHeight / 4;

    this.bubble = this.add.graphics({ x: x, y: y });

    //  Bubble shadow
    this.bubble.fillStyle(0x222222, 0.5);
    this.bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

    //  Bubble color
    this.bubble.fillStyle(0xffffff, 1);

    //  Bubble outline line style
    this.bubble.lineStyle(4, 0x565656, 1);

    //  Bubble shape and outline
    this.bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    this.bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    //  Calculate arrow coordinates
    const point1X = Math.floor(bubbleWidth / 7);
    const point1Y = bubbleHeight;
    const point2X = Math.floor((bubbleWidth / 7) * 2);
    const point2Y = bubbleHeight;
    const point3X = Math.floor(bubbleWidth / 7);
    const point3Y = Math.floor(bubbleHeight + arrowHeight);

    //  Bubble arrow shadow
    this.bubble.lineStyle(4, 0x222222, 0.5);
    this.bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

    //  Bubble arrow fill
    this.bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
    this.bubble.lineStyle(2, 0x565656, 1);
    this.bubble.lineBetween(point2X, point2Y, point3X, point3Y);
    this.bubble.lineBetween(point1X, point1Y, point3X, point3Y);

    this.interaction = this.add.text(0, 0, quote, {
      fontFamily: 'MapleStory',
      fontSize: 20,
      color: '#000000',
      align: 'center',
      wordWrap: { width: bubbleWidth - bubblePadding * 2 },
    });

    this.nextButton = this.add
      .text(0, 0, 'START', {
        fontFamily: 'Arial',
        fontSize: 15,
        color: '#000000',
        align: 'center',
        wordWrap: { width: bubbleWidth - bubblePadding * 2 },
      })
      .setInteractive()
      .on('pointerdown', this.startSignLanguage, this);

    this.closeButton = this.add
      .text(0, 0, 'CLOSE', {
        fontFamily: 'Arial',
        fontSize: 15,
        color: '#000000',
        align: 'center',
        wordWrap: { width: bubbleWidth - bubblePadding * 2 },
      })
      .setInteractive()
      .on('pointerdown', this.closeConversation, this);

    const b = this.interaction.getBounds();
    this.interaction.setPosition(
      this.bubble.x + bubbleWidth / 2 - b.width / 2,
      this.bubble.y + bubbleHeight / 2 - b.height / 2,
    );

    const c = this.nextButton.getBounds();
    this.nextButton.setPosition(
      this.bubble.x + bubbleWidth / 2 - c.width / 2 - 50,
      this.bubble.y + bubbleHeight / 2 - c.height / 2 + 30,
    );
    this.nextButton.setVisible(true);

    const d = this.closeButton.getBounds();
    this.closeButton.setPosition(
      this.bubble.x + bubbleWidth / 2 - d.width / 2 + 50,
      this.bubble.y + bubbleHeight / 2 - d.height / 2 + 30,
    );
    this.closeButton.setVisible(true);
  }

  closeConversation() {
    console.log('closed');
    this.bubble?.setVisible(false);
    this.interaction?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.closeButton?.setVisible(false);
    this.isOverlap = false;
  }
}
