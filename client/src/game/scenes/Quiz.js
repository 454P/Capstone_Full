import Button from '../objects/Button';
import Particles from '../objects/Particles';
import { emitter, scene } from './constants';
import axios from 'axios';
import Phaser from 'phaser';

export default class Quiz extends Phaser.Scene {
  constructor() {
    super(scene.quiz);
    this.count = 0;
    this.score = 0;
    this.start = false;
    this.end = false;
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
    // const { width, height } = {1280, 800};
    const width = 1280;
    const height = 800;
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
    // this.videoIncorrect = this.add.video(300, 200).setOrigin(0, 0).setVisible(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
      this.video?.loadMediaStream(stream, false);
      this.video?.play(true);
    });

    // button
    this.startButton = new Button(this, width / 2, height / 2, '시작', 90, this.startQuiz);
    this.closeButton = this.add
      .text(width / 2, height / 2 + 200, '종료', {
        fontFamily: 'MapleStory',
        fontSize: 90,
        fontStyle: 'bold',
        color: 'white',
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', this.endQuiz, this)
      .on('pointerover', () => this.button.setStyle({ fill: '#f39c12' }))
      .on('pointerout', () => this.button.setStyle({ fill: '#000000' }))
      .setVisible(false);

    this.incorrects = [];
    this.incorrectsText = this.add
      .text(width / 2, 250, this.incorrects, {
        fontFamily: 'MapleStory',
        fontSize: 40,
        fontStyle: 'bold',
        color: 'red',
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.endScore = 0;

    // particles
    this.rainParticles = new Particles({ scene: this, type: 'rain' });
    this.starParticles = new Particles({ scene: this, type: 'star' });

    // 오답 체크
    // {word:xxx, success:true}
    this.words = [];
  }

  endQuiz() {
    // emitter.emit('end quiz', this.endScore);
    this.scene.pause();
    emitter.emit('start review');
  }

  showAnswer(answer, word) {
    if (answer === 1) {
      this.quizText.setText('맞았습니다.');
      this.score += 100;
      this.starParticles.play();
      this.words.push({ word: word, success: true });
    } else {
      this.quizText.setText('틀렸습니다.');
      this.rainParticles.play();
      this.words.push({ word: word, success: false });
    }

    setTimeout(() => {
      this.nextQuiz();
    }, 5000);
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
        console.log(data);
        console.log('startSign', data);
        await this.showAnswer(data, response.data.word);
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
        const incorrects = [];
        this.words.forEach((problem) => {
          if (problem.success === false) incorrects.push(problem.word);
        });
        this.quizText.setText('끝!');
        this.incorrectsText.setText(incorrects).setVisible(true);

        this.start = false;
        this.end = true;

        const response2 = await axios.post('http://49.142.76.124:8000/game/end', {
          api: this.apiKey,
          words: this.words,
        });

        console.log('End', response2);
        this.endScore = response2.data.score;
        this.closeButton.setVisible(true);
      } else {
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
      }
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
}
