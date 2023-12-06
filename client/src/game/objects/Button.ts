import Phaser from 'phaser';

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  pointerDownFunc?: () => void;
}

export default class Button {
  constructor({ scene, x, y, text, fontSize, pointerDownFunc }: Props) {
    const button = scene.add
      .text(x, y, text)
      .setOrigin(0.5)
      .setStyle({ font: 'MapleStory', fill: '#000000' })
      .setFontSize(12);

    if (fontSize) button.setFontSize(fontSize);
    if (pointerDownFunc)
      button
        .setInteractive()
        .on('pointerdown', pointerDownFunc, scene)
        .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
        .on('pointerout', () => button.setStyle({ fill: '#000000' }));
  }
}
