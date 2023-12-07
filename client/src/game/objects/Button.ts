import Phaser from 'phaser';

export default class Button {
  button: Phaser.GameObjects.Text;
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, fontSize?: number, pointerDownFunc?: Function) {
    this.scene = scene;
    this.button = scene.add
      .text(x, y, text)
      .setOrigin(0.5)
      .setStyle({ font: 'MapleStory', fill: '#000000' })
      .setFontSize(12)
      .setFontFamily('MapleStory')
      .setFontStyle('bold')
      .setDepth(1);

    if (fontSize) this.button.setFontSize(fontSize);
    if (pointerDownFunc)
      this.button
        .setInteractive()
        .on('pointerdown', pointerDownFunc, scene)
        .on('pointerover', () => this.button.setStyle({ fill: '#f39c12' }))
        .on('pointerout', () => this.button.setStyle({ fill: '#000000' }));
  }

  getBounds() {
    return this.button.getBounds();
  }

  getX() {
    return this.button.x;
  }

  setPosition(x: number, y: number) {
    this.button.setPosition(x, y);
  }

  setVS(flag: boolean) {
    this.button.setVisible(flag);
  }

  destroy() {
    this.button.destroy();
  }

  setPointerDownFunction(pointerDownFunc: Function) {
    this.button
      .setInteractive()
      .on('pointerdown', pointerDownFunc, this.scene)
      .on('pointerover', () => this.button.setStyle({ fill: '#f39c12' }))
      .on('pointerout', () => this.button.setStyle({ fill: '#000000' }));
  }
}
