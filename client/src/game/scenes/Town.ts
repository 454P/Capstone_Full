import NPC from '../players/NPC';
import OtherPlayer from '../players/OtherPlayer';
import Player from '../players/Player';
import { PlayerInfo, spriteInfo, spriteInfoInterface } from '../players/constants';
import { emitter, scene } from './constants';
import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

interface customSocket {
  nickname: string;
  socket: Socket;
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

  constructor() {
    super(scene.town);
    this.otherPlayers = [];
    this.isOverlap = false;
    this.conversation = '';
  }

  init() {
    if (!this.socket) {
      emitter.on('initPlayer', (mySocket: customSocket) => {
        this.socket = mySocket.socket;
        this.nickname = mySocket.nickname;
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

    this.player && this.physics.add.overlap(this.npc, this.player, this.npcInteraction, undefined, this);
  }

  npcInteraction() {
    if (!this.isOverlap) {
      this.isOverlap = true;
      this.createSpeechBubble(70, 400, 250, 100, 'Hello World');
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

    const bubble = this.add.graphics({ x: x, y: y });

    //  Bubble shadow
    bubble.fillStyle(0x222222, 0.5);
    bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

    //  Bubble color
    bubble.fillStyle(0xffffff, 1);

    //  Bubble outline line style
    bubble.lineStyle(4, 0x565656, 1);

    //  Bubble shape and outline
    bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    //  Calculate arrow coordinates
    const point1X = Math.floor(bubbleWidth / 7);
    const point1Y = bubbleHeight;
    const point2X = Math.floor((bubbleWidth / 7) * 2);
    const point2Y = bubbleHeight;
    const point3X = Math.floor(bubbleWidth / 7);
    const point3Y = Math.floor(bubbleHeight + arrowHeight);

    //  Bubble arrow shadow
    bubble.lineStyle(4, 0x222222, 0.5);
    bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

    //  Bubble arrow fill
    bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
    bubble.lineStyle(2, 0x565656, 1);
    bubble.lineBetween(point2X, point2Y, point3X, point3Y);
    bubble.lineBetween(point1X, point1Y, point3X, point3Y);

    this.interaction = this.add.text(0, 0, quote, {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#000000',
      align: 'center',
      wordWrap: { width: bubbleWidth - bubblePadding * 2 },
    });

    const b = this.interaction.getBounds();

    this.interaction.setPosition(bubble.x + bubbleWidth / 2 - b.width / 2, bubble.y + bubbleHeight / 2 - b.height / 2);
  }
}
