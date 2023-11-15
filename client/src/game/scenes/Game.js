import { scene } from './constants';
import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
  constructor() {
    super(scene.game);
    this.quizArray = ['안녕하세요.', '사람', '슬픔', '행복'];
    this.idx = 0;
    this.score = 0;
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
    this.timer = this.add.text(50, 50, '', { fontFamily: 'MapleStory', fontSize: 30, fontStyle: 'bold' });
    this.timedEvent = this.time.delayedCall(5000, this.onEvent, [], this);

    // quiz
    this.quiz = this.quizArray[this.idx];
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
  }

  update() {
    this.timer?.setText(`TIMER: ${(5 - this.timedEvent?.getElapsedSeconds()).toString().substring(0, 3)}`);
    this.quizText?.setText(this.quiz);
    this.scoreText.setText(this.score.toString());
    this.answerText.setText(this.answer);
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

  async showNextQuiz() {
    if (this.idx === this.quizArray.length - 1) {
      this.quiz = 'END';
    } else {
      this.timedEvent = this.time.delayedCall(5000, this.onEvent, [], this);
      this.quiz = this.quizArray[++this.idx];
    }
  }
}
