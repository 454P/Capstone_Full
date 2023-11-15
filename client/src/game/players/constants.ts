export type actionType = "front" | "back" | "left" | "right";

export interface spriteInfoInterface {
    action: actionType;
    start: number;
    end: number;
}

export const spriteInfo: spriteInfoInterface[] = [
    { action: "front", start: 1, end: 4 },
    { action: "back", start: 5, end: 8 },
    { action: "left", start: 9, end: 12 },
    { action: "right", start: 13, end: 16 },
];

export interface PlayerInfo {
    id: string;
    x: number;
    y: number;
    direction: actionType;
    nickname: string;
}
