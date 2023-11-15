import { Socket } from "socket.io-client";
import type { actionType, PlayerInfo } from "./constants";
import { emitter } from "../scenes/constants";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    static PLAYER_SPPED = 5;

    character: Phaser.GameObjects.Sprite | undefined;
    x: number;
    y: number;
    direction: actionType;
    isMove: boolean;
    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    nickname: string;
    nicknameTag: Phaser.GameObjects.Text;
    socket: Socket;

    constructor(scene: Phaser.Scene, x: number, y: number, nickname: string, socket: Socket) {
        super(scene, 0, 0, "character");

        this.x = x;
        this.y = y;
        this.direction = "front";
        this.isMove = false;

        this.nickname = nickname;

        this.character = scene.physics.add.sprite(this.x, this.y, this.direction);
        this.character.setScale(2);
        this.character.play(this.direction);
        this.cursorKeys = this.scene.input.keyboard?.createCursorKeys();
        this.nicknameTag = scene.add.text(this.x, this.y + 20, nickname);
        this.socket = socket;
        this.socket.emit("init player", {
            id: socket.id,
            x: this.x,
            y: this.y,
            direction: this.direction,
            nickname: nickname,
        });
    }

    update() {
        this.changeDirection();
        this.character?.setPosition(this.x, this.y);
        this.nicknameTag.setPosition(this.x, this.y + 20);
    }

    changeDirection() {
        if (!this.cursorKeys) return;

        if (this.cursorKeys.left.isDown) {
            this.direction = "left";
            this.character?.play("left");
            this.isMove = true;
            this.x -= Player.PLAYER_SPPED;
        } else if (this.cursorKeys.right.isDown) {
            this.direction = "right";
            this.character?.play("right");
            this.isMove = true;
            this.x += Player.PLAYER_SPPED;
        } else if (this.cursorKeys.down.isDown) {
            this.direction = "front";
            this.character?.play("front");
            this.y += Player.PLAYER_SPPED;
            this.isMove = true;
        } else if (this.cursorKeys.up.isDown) {
            this.direction = "back";
            this.character?.play("back");
            this.y -= Player.PLAYER_SPPED;
            this.isMove = true;
        }
        // if (this.isMove) console.log(this.x, this.y);
        if (this.isMove) {
            this.socket.emit("move player", {
                id: this.socket.id,
                x: this.x,
                y: this.y,
                direction: this.direction,
                nickname: this.nickname,
            });
        }
        this.isMove = false;
    }
}
