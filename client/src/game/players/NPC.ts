export default class NPC extends Phaser.Physics.Arcade.Sprite {
    character: Phaser.GameObjects.Sprite | undefined;
    characterNickname: Phaser.GameObjects.Text | undefined;
    x: number;
    y: number;

    constructor(scene: Phaser.Scene, x: number, y: number, nickname: string) {
        super(scene, x, y, "chicken");
        this.x = x;
        this.y = y;
        this.character = scene.physics.add.sprite(this.x, this.y, "jump");
        this.character.setScale(2);
        this.character.play("jump");
        this.characterNickname = scene.add.text(this.x, this.y + 20, nickname);
    }
}
