import type { actionType } from "./constants";

export default class OtherPlayer extends Phaser.Physics.Arcade.Sprite {
    character: Phaser.GameObjects.Sprite | undefined;
    characterNickname: Phaser.GameObjects.Text | undefined;
    x: number;
    y: number;
    direction: actionType;
    id: string;

    constructor(scene: Phaser.Scene, x: number, y: number, nickname: string, id: string, direction: actionType) {
        super(scene, 0, 0, "character");
        console.log("other player");
        this.x = x;
        this.y = y;
        this.id = id;
        this.direction = direction;
        this.character = scene.add.sprite(this.x, this.y, this.direction);
        this.character.setScale(2);
        this.character.play(this.direction);
        this.characterNickname = scene.add.text(this.x, this.y + 20, nickname);
    }

    update(x: number, y: number, direction: actionType) {
        this.character?.setPosition(x, y);
        this.character?.play(direction);
        this.characterNickname?.setPosition(x, y + 20);
    }
}
