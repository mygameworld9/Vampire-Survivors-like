
import { IMapData } from "../utils/types";

export const MAP_DATA: { [key: string]: IMapData } = {
    FOREST: {
        id: 'FOREST',
        nameKey: 'map.forest.name',
        descriptionKey: 'map.forest.desc',
        tileSize: 100,
        baseColors: ['#C8E6C9', '#A5D6A7'], // Pastel Green Checkerboard
        decoration: 'flower',
        backgroundColor: '#A5D6A7'
    },
    CRYPT: {
        id: 'CRYPT',
        nameKey: 'map.crypt.name',
        descriptionKey: 'map.crypt.desc',
        tileSize: 100,
        baseColors: ['#B0BEC5', '#90A4AE'], // Pastel Blue-Grey Checkerboard
        decoration: 'crack',
        backgroundColor: '#90A4AE'
    }
};