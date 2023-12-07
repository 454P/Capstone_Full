import Button from '../objects/Button';
import Particles from '../objects/Particles';
import NPC from '../players/NPC';
import OtherPlayer from '../players/OtherPlayer';
import Player from '../players/Player';
import { PlayerInfo, spriteInfo, spriteInfoInterface } from '../players/constants';
import { emitter, scene } from './constants';
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
  npc1?: Phaser.Physics.Arcade.Sprite;
  npc2?: Phaser.Physics.Arcade.Sprite;
  npc3?: Phaser.Physics.Arcade.Sprite;
  isOverlap: boolean;
  interaction?: Phaser.GameObjects.Text;
  conversation: string;
  quizButton?: Phaser.GameObjects.Text;
  bubble?: Phaser.GameObjects.Graphics;
  apiKey?: string;
  particleButton?: Phaser.GameObjects.Text;
  rainParticles?: Particles;
  starParticles?: Particles;

  constructor() {
    super(scene.town);
    this.otherPlayers = [];
    this.isOverlap = false;
    this.conversation = '';
  }

  init() {
    console.log(localStorage.getItem('apiKey'), this.socket);
    const apik = localStorage.getItem('apiKey');
    // if (!apik) {
    //   this.socketConnection();
    // }

    if (!this.socket) {
      emitter.on('initPlayer', (mySocket: customSocket) => {
        console.log('initPlayer', mySocket);
        this.socket = mySocket.socket;
        this.nickname = mySocket.nickname;
        this.apiKey = mySocket.apiKey;
        localStorage.setItem('apiKey', mySocket.apiKey);
      });
    }

    emitter.emit('init');
    console.log('socket connection1');
    this.socketConnection();
  }

  create() {
    // background
    const map = this.make.tilemap({ key: 'tmp' });

    const fences = map.addTilesetImage('Fences', 'fence_tiles');
    const flowers = map.addTilesetImage('Flowers', 'flower_tiles');
    const grass = map.addTilesetImage('Grass_Hill', 'grass_hill_tiles');
    const house = map.addTilesetImage('Houses', 'house_tiles');
    const plant = map.addTilesetImage('Plants', 'plant_tiles');
    const slope = map.addTilesetImage('Slopes', 'slope_tiles');
    const soil = map.addTilesetImage('Soil', 'soil_tiles');
    const tree = map.addTilesetImage('Trees', 'tree_tiles');
    const water = map.addTilesetImage('Water', 'water_tiles');

    const waterLayer = water && map.createLayer('Water', water, 0, 0);
    const grassLayer = grass && map.createLayer('Grass', grass, 0, 0);
    const islandTileSet = slope && grass;
    const isLandLayer = islandTileSet && map.createLayer('Island', islandTileSet, 0, 0);
    const farmLayer = soil && map.createLayer('Farm', soil, 0, 0);
    const objectTileSet = fences && flowers && house && plant && tree && [fences, flowers, house, plant, tree];
    const objectLayer = objectTileSet && map.createLayer('Object', objectTileSet);

    const { width, height } = this.scale;

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
        Math.floor(Math.random() * 10) + width / 2,
        Math.floor(Math.random() * 10) + height / 2,
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
    this.npc1 = new NPC(this, 500, 500, 'npc1');
    this.npc2 = new NPC(this, 800, 600, 'QUIZ');
    this.npc3 = new NPC(this, 900, 400, 'REVIEW');
    this.physics.add.group([this.npc1, this.npc2, this.npc3]);
    this.physics.add.group(this.player);
    this.physics.add.group(this.interaction);
    this.interaction = this.add.text(0, 0, '');
    this.player && this.physics.add.overlap(this.npc1, this.player, this.npcInteraction, undefined, this);
    this.player && this.physics.add.overlap(this.npc2, this.player, this.startQuiz, undefined, this);
    this.player && this.physics.add.overlap(this.npc3, this.player, this.startReview, undefined, this);
    // particles
    this.rainParticles = new Particles({ scene: this, type: 'rain' });
    this.starParticles = new Particles({ scene: this, type: 'star' });
  }

  startReview() {
    if (!this.isOverlap) {
      this.isOverlap = true;
      const startButton = new Button(this, 0, 0, 'start', 20, () => {
        emitter.emit('start review');
      });
      const closeButton = new Button(this, 0, 0, 'close', 20);
      closeButton.setPointerDownFunction(() => {
        this.closeConversation([startButton, closeButton]);
      });
      this.createSpeechBubble(900, 200, 250, 150, '복습하시겠습니까??', [startButton, closeButton]);
    }
  }

  startQuiz() {
    if (!this.isOverlap) {
      this.isOverlap = true;
      const soloQuizButton = new Button(this, 0, 0, '1 player', 20, () => {
        emitter.emit('start quiz');
        this.scene.pause();
        this.scene.start(scene.quiz);
      });
      const closeButton = new Button(this, 0, 0, 'close', 20);
      closeButton.setPointerDownFunction(() => {
        this.closeConversation([soloQuizButton, closeButton]);
      });
      this.createSpeechBubble(800, 350, 400, 150, '퀴즈를 시작하시겠어요?', [soloQuizButton, closeButton]);
    }
  }

  npcInteraction() {
    if (!this.isOverlap) {
      this.isOverlap = true;
      const closeButton = new Button(this, 0, 0, 'close', 20);
      const nextButton = new Button(this, 0, 0, 'next', 20);

      closeButton.setPointerDownFunction(() => {
        this.closeConversation([nextButton, closeButton]);
      });
      nextButton.setPointerDownFunction(() => {
        this.closeConversation([nextButton, closeButton]);
        this.startSignLanguage();
      });
      this.createSpeechBubble(500, 300, 250, 150, '안녕하세요', [nextButton, closeButton]);
    }
  }

  async startSignLanguage() {
    this.createSpeechBubble(500, 300, 250, 150, '안녕하세요');
    setTimeout(() => {
      this.interaction?.setText('맞았습니다');
      this.starParticles?.play();
    }, 3000);
    setTimeout(() => {
      this.closeConversation();
    }, 5000);
    // this.socket?.emit('sign', { api: this.apiKey, word: '안녕하세요', type: 2, count: 1 });
    // this.socket?.on('sign response1', (data: number) => {
    //   console.log(data);
    //   if (data) {
    //     this.interaction?.setText('맞았습니다.');
    //     this.starParticles?.play();
    //   } else {
    //     this.interaction?.setText('틀렸습니다.');
    //     this.rainParticles?.play();
    //   }

    //   setTimeout(() => {
    //     this.closeConversation([]);
    //   }, 5000);
    // });
  }

  update() {
    this.player?.update(false);
  }

  socketConnection() {
    console.log(this.socket, 'connection2');
    console.log('socket connection');

    if (this.socket?.disconnected) {
      console.log('conection');
    }

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

    this.socket?.on('remove other player', (data) => {
      if (data) {
        this.otherPlayers.forEach((otherPlayer) => {
          if (otherPlayer.socketId === data.id) otherPlayer.sprite.update(0, 0, 'front', true);
        });
      }
    });
  }

  createSpeechBubble(x: number, y: number, width: number, height: number, quote: string, buttons?: Button[]) {
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
      color: '#000000',
      align: 'center',
      fontSize: '20px',
      wordWrap: { width: bubbleWidth - bubblePadding * 2 },
    });

    const b = this.interaction.getBounds();
    this.interaction.setPosition(
      this.bubble.x + bubbleWidth / 2 - b.centerX,
      buttons
        ? this.bubble.y + bubbleHeight / (2 ** (buttons.length + 1) - 1) - b.centerY + 5
        : this.bubble.y + bubbleHeight / 2 - b.centerY,
    );

    if (buttons) {
      buttons.forEach((button, idx) => {
        const bound = button.getBounds();
        this.bubble &&
          button.setPosition(
            this.bubble.x + bubbleWidth / 2 - bound.centerX,
            this.bubble.y +
              ((buttons.length + 1) * (idx + 1) * bubbleHeight) / (2 ** (buttons.length + 1) - 1) -
              bound.centerY +
              5,
          );
      });
    }
  }

  closeConversation(buttons?: Button[]) {
    this.bubble?.setVisible(false);
    this.interaction?.setVisible(false);
    buttons && buttons.forEach((button) => button.destroy());
    this.isOverlap = false;
  }
}
