import { waitFor } from '@testing-library/react';
import Button from '../objects/Button';
import Particles from '../objects/Particles';
import { emitter, scene } from './constants';
import axios from 'axios';
import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
  constructor() {
    super(scene.quiz);
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
    const map = this.make.tilemap({ key: scene.quiz });
    const { width, height } = this.scale;
    const grass = map.addTilesetImage('Grass_Hill', 'grass_hill_tiles');
    const water = map.addTilesetImage('Water', 'water_tiles');
    const fence = map.addTilesetImage('Fence', 'fence_tiles');
    const flower = map.addTilesetImage('Flowers', 'flower_tiles');
    const tree = map.addTilesetImage('Trees', 'tree_tiles');
    const tilesets = grass && fence && water && flower && tree && [grass, fence, water, flower, tree];

    tilesets && map.createLayer('Grass', tilesets, 0, 0);
    tilesets && map.createLayer('Object', tilesets, 0, 0);

    // quiz
    this.quizText = this.add
      .text(width / 2, 100, '', { fontFamily: 'MapleStory', fontSize: 80, fontStyle: 'bold' })
      .setOrigin(0.5);
    this.scoreText = this.add
      .text(width - 200, 100, '', { fontFamily: 'MapleStory', fontSize: 60, fontStyle: 'bold', color: '#4B280A' })
      .setOrigin(0.5);
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
    this.startButton = new Button(this, width / 2, height / 2, '시작', 90, this.startQuiz);

    // particles
    this.rainParticles = new Particles({ scene: this, type: 'rain' });
    this.starParticles = new Particles({ scene: this, type: 'star' });

    // 오답 체크
    // {word:xxx, success:true}
    this.words = [];
  }

  showAnswer(answer, word) {
    if (answer === 1) {
      this.quizText.setText('맞았습니다.');
      this.starParticles.play();
      this.words.push({ word: word, success: true });
    } else {
      this.quizText.setText('틀렸습니다.');
      this.rainParticles.play();
      this.words.push({ word: word, success: false });
    }

    setTimeout(() => {
      this.nextQuiz();
    }, 4000);
  }

  async startQuiz() {
    try {
      const response = await axios.post('http://49.142.76.124:8000/game/start', { api: this.apiKey, count: 0 });
      console.log('start', response);
      this.quizText.setText(response.data.word);
      this.count = response.data.count;
      this.start = true;

      this.socket?.emit('sign', { api: this.apiKey, word: response.data.word, type: 2, count: this.count });

      this.socket.on('sign response1', async (data) => {
        console.log('startSign', data);
        this.start = false;
        await this.showAnswer(data, response.data.word);
        // this.nextQuiz();
        // if (data === 1) {
        //   this.score += 100;
        //   this.starParticles.play();
        // } else {
        //   this.rainParticles.play();
        // }
        // this.nextQuiz();
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

      // 끝났을 떄
      if (response.data.status === 201) {
        let incorrects = '끝!\n';
        this.words.forEach((problem) => {
          if (problem.success === false) incorrects += problem.word + '\n';
        });
        this.quizText.setText(incorrects);
        this.start = false;
        //
        const response = await axios.post('http://49.142.76.124:8000/game/end', {
          api: this.apiKey,
          words: this.words,
        });
        console.log(this.words);

        console.log('End', response);
        return;
      }

      this.quizText.setText(response.data.word);
      this.count = response.data.count;
      this.start = true;

      this.socket?.emit('sign', { api: this.apiKey, word: response.data.word, type: 2, count: this.count });

      this.socket.on(`sign response${this.count}`, async (data) => {
        console.log('nextSign', data);
        await this.showAnswer(data, response.data.word);
        // this.nextQuiz();

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
      this.startButton.destroy();
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
