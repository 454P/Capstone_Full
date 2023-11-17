import { emitter, scene } from './constants';
import axios from 'axios';
import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

export default class Game extends Phaser.Scene {
  constructor() {
    super(scene.game);
    this.count = 0;
    this.score = 0;
    this.start = false;
  }

  init() {
    if (!this.socket) {
      emitter.on('send socket info', (mySocket) => {
        console.log(mySocket);
        this.socket = mySocket.socket;
        this.nickname = mySocket.nickname;
        this.apiKey = mySocket.apiKey;
      });
    }
    emitter.emit('init game');
  }

  create() {
    // background map
    const map = this.make.tilemap({ key: 'game' });

    const grass = map.addTilesetImage('Grass_Hill', 'grass_hill_tiles');
    const water = map.addTilesetImage('Water', 'water_tiles');
    const fence = map.addTilesetImage('Fence', 'fence_tiles');
    const flower = map.addTilesetImage('Flowers', 'flower_tiles');
    const tree = map.addTilesetImage('Trees', 'tree_tiles');
    const tilesets = grass && fence && water && flower && tree && [grass, fence, water, flower, tree];

    tilesets && map.createLayer('Grass', tilesets, 0, 0);
    tilesets && map.createLayer('Object', tilesets, 0, 0);

    // timer
    // this.timer = this.add.text(50, 50, '', { fontFamily: 'MapleStory', fontSize: 30, fontStyle: 'bold' });
    // this.timedEvent = this.time.delayedCall(5000, this.onEvent, [], this);

    // quiz
    // this.quiz = this.quizArray[this.idx];
    this.quizText = this.add.text(400, 50, '', { fontFamily: 'MapleStory', fontSize: 80, fontStyle: 'bold' });
    this.scoreText = this.add.text(1000, 50, '', { fontFamily: 'MapleStory', fontSize: 60, fontStyle: 'bold' });
    this.answer = '';
    this.answerText = this.add.text(400, 50, '', {
      fontFamily: 'MapleStory',
      fontSize: 90,
      fontStyle: 'bold',
      color: 'red',
    });

    // video
    this.video = this.add.video(300, 200).setOrigin(0, 0).setVisible(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
      this.video?.loadMediaStream(stream, false);
      this.video?.play(true);
    });

    // button
    this.startButton = this.add
      .text(500, 200, 'START', {
        fontFamily: 'MapleStory',
        fontSize: 90,
        fontStyle: 'bold',
      })
      .setInteractive()
      .on('pointerdown', this.startQuiz, this);

    // this.nextButton = this.add
    //   .text(100, 100, 'NEXT', {
    //     fontFamily: 'MapleStory',
    //     fontSize: 20,
    //     fontStyle: 'bold',
    //   })
    //   .setInteractive()
    //   .on('pointerdown', this.nextQuiz, this);
  }

  async startQuiz() {
    try {
      const response = await axios.post('http://49.142.76.124:8000/game/start', { api: this.apiKey, count: 0 });
      console.log('start', response);
      this.quizText.setText(response.data.word);
      this.count = response.data.count;
      this.start = true;

      this.socket?.emit('sign', { api: this.apiKey, word: response.data.word, type: 2, count: this.count });

      this.socket.on('sign response1', (data) => {
        console.log('startSign', data);
        this.start = false;
        if (data === 1) this.score += 100;
        this.nextQuiz();
      });
    } catch (error) {
      console.log(error);
    }
  }

  async nextQuiz() {
    try {
      console.log('count:', this.count);
      const response = await axios.post('http://49.142.76.124:8000/game/next', { api: this.apiKey, count: this.count });
      console.log('next', response);
      this.quizText.setText(response.data.word);
      this.count = response.data.count;
      this.start = true;

      this.socket?.emit('sign', { api: this.apiKey, word: response.data.word, type: 2, count: this.count });

      this.socket.on(`sign response${this.count}`, (data) => {
        console.log('nextSign', data);
        this.start = false;
        if (data === 1) {
          this.score += 100;
          console.log(this.score);
        }
        this.nextQuiz();
        this.socket.off(`sign response${this.count}`);
      });
    } catch (error) {
      this.quizText.setText('끝!');
      this.start = false;
      console.log(error);
    }
  }

  update() {
    this.scoreText.setText('점수: ' + this.score.toString());

    if (this.start) {
      this.startButton.setVisible(false);
      this.video.setVisible(true);
    } else {
      this.video.setVisible(false);
    }
  }

  // timer event
  async onEvent() {
    console.log('call back function');
    const subScore = await this.getScore();
    if (subScore) {
      this.score += subScore;
      this.quiz = '';
      this.answer = '맞췄습니다.';
      await this.sleep(1000);
      this.answer = '';
    }

    this.showNextQuiz();
  }

  sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async getScore() {
    // 맞췄는지 확인하는 함수
    return 100;
  }
}
