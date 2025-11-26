
import { Game } from "../Game";
import { SPAWN_SCHEDULE } from "../../data/gameConfig";
import { ENEMY_DATA } from "../../data/enemyData";
import { ITEM_DATA } from "../../data/itemData";
import { CHEST_DATA } from "../../data/chestData";
import { PROP_DATA } from "../../data/propData";
import { Enemy } from "../../entities/Enemy";
import { Item } from "../../entities/Item";
import { Chest } from "../../entities/Chest";

const ELITE_SPAWN_START_TIME = 300; // 5 minutes
const ELITE_SPAWN_CHANCE = 0.1; // 10% chance

export class SpawnSystem {
    private spawnManager: { [type: string]: { rate: number, timer: number } } = {};
    private nextSpawnEventIndex = 0;
    private itemSpawnTimer = 0;
    private propSpawnTimer = 0;
    private readonly ITEM_SPAWN_INTERVAL = 15; // seconds
    private readonly PROP_SPAWN_INTERVAL = 2; // spawn a prop every 2 seconds

    constructor(private game: Game) {}

    update(dt: number) {
        // --- Handle Enemy Spawning Schedule ---
        while (this.nextSpawnEventIndex < SPAWN_SCHEDULE.length && this.game.gameTime >= SPAWN_SCHEDULE[this.nextSpawnEventIndex].time) {
            const event = SPAWN_SCHEDULE[this.nextSpawnEventIndex];
            this.spawnManager[event.enemyType] = { rate: event.rate, timer: 0 };
            this.nextSpawnEventIndex++;
        }
        
        for (const type in this.spawnManager) {
            const manager = this.spawnManager[type];
            manager.timer += dt * 1000;
            if (manager.timer >= manager.rate) {
                const amountToSpawn = Math.floor(manager.timer / manager.rate);
                for (let i = 0; i < amountToSpawn; i++) {
                     const canBeElite = this.game.gameTime >= ELITE_SPAWN_START_TIME;
                     const isElite = canBeElite && Math.random() < ELITE_SPAWN_CHANCE;
                     this.spawnEnemy(type, isElite);
                }
                manager.timer %= manager.rate;
            }
        }

        // --- Handle Item Spawning ---
        this.itemSpawnTimer += dt;
        if (this.itemSpawnTimer >= this.ITEM_SPAWN_INTERVAL) {
            this.itemSpawnTimer = 0;
            this.spawnItem();
        }

        // --- Handle Prop Spawning ---
        this.propSpawnTimer += dt;
        if (this.propSpawnTimer >= this.PROP_SPAWN_INTERVAL) {
            this.propSpawnTimer = 0;
            this.spawnProp();
        }
    }

    spawnEnemy(type: string, isElite: boolean = false) {
        const data = ENEMY_DATA[type];
        if (!data) return;

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.game.width, this.game.height) / 2 + 50;
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;
        
        // Use pooling
        const enemy = this.game.enemyPool.get();
        enemy.reset(x, y, data, type, isElite);
        this.game.enemies.push(enemy);
    }

    spawnProp() {
        // Randomly choose CRATE or BARREL
        const type = Math.random() > 0.5 ? 'CRATE' : 'BARREL';
        const data = PROP_DATA[type];
        if (!data) return;

        // Spawn logic: Just outside view, but in random directions
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.game.width, this.game.height) / 2 + 100;
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;

        const prop = this.game.propPool.get();
        prop.reset(x, y, data);
        this.game.props.push(prop);
    }

    spawnItem() {
        // For now, just spawn the health potion
        const itemType = 'HEALTH_POTION';
        const data = ITEM_DATA[itemType];
        if (!data) return;

        // Spawn in a random direction, within the screen view but not too close
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() * (this.game.width / 3)) + 100; // Random radius from player
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;
        this.game.items.push(new Item(x, y, data));
    }

    spawnChestNearPlayer() {
        if (this.game.player) {
            this.game.chests.push(new Chest(this.game.player.pos.x + 80, this.game.player.pos.y, CHEST_DATA));
        }
    }
}
