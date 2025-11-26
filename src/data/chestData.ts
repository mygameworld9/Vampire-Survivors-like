import { IChestData } from "../utils/types";

export const CHEST_DATA: IChestData = {
    spriteSheet: './items/chest.png',
    spriteWidth: 32,
    spriteHeight: 32,
    size: 32,
    animations: {
        closed:  { frameY: 0, maxFrames: 1 },
        opening: { frameY: 1, maxFrames: 5, interval: 100 }, // 5 frames, 100ms each
        opened:  { frameY: 2, maxFrames: 1 },
    }
};