import Phaser from 'phaser';

interface Props {
  scene: Phaser.Scene;
  type: 'rain' | 'star';
}

export default class Particles {
  particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor({ scene, type }: Props) {
    this.particles = type === 'rain' ? scene.add.particles('rain-particle') : scene.add.particles('star-particle');
    const { width } = scene.scale;

    this.emitter = this.particles.createEmitter({
      x: 0,
      y: 0,
      // emitZone
      emitZone: {
        source: new Phaser.Geom.Rectangle(-width * 3, 0, width * 7, 100),
        type: 'random',
        quantity: 70,
      },
      speedY: { min: 20, max: 50 },
      // speedX: { min: -20, max: 20 },
      accelerationY: { random: [10, 15] },
      // lifespan
      lifespan: { min: 3000, max: 3000 },
      scale: { random: [0.5, 1.25] },
      alpha: { random: [0.8, 1.0] },
      gravityY: 20,
      frequency: 1,
      blendMode: 'NORMAL',
      // follow the player at an offiset
      //   follow: this.player,
      //   followOffset: { x: -width * 0.5, y: -height - 100 },
    });
    this.emitter.stop();
  }

  play() {
    this.emitter.start();
    setTimeout(() => {
      this.emitter.stop();
    }, 3000);
  }

  getParticle() {
    return this.particles;
  }
}
