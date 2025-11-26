
import { Game } from "../Game";
import { SPAWN_SCHEDULES } from "../../data/spawnData";
import { ENEMY_DATA } from "../../data/enemyData";
import { ITEM_DATA } from "../../data/itemData";
import { CHEST_DATA } from "../../data/chestData";
import { PROP_DATA } from "../../data/propData";
import { Item } from "../../entities/Item";
import { Chest } from "../../entities/Chest";
import { ExplorationPoint } from "../../entities/ExplorationPoint";
import { ISpawnSchedule } from "../../utils/types";

const ELITE_SPAWN_START_TIME = 300; // 5 minutes
const ELITE_SPAWN_CHANCE = 0.1; // 10% chance

export class SpawnSystem {
    private spawnManager: { [type: string]: { rate: number, timer: number } } = {};
    private nextSpawnEventIndex = 0;
    private itemSpawnTimer = 0;
    private propSpawnTimer = 0;
    private explorationSpawnTimer = 45; 
    
    private readonly ITEM_SPAWN_INTERVAL = 15; 
    private readonly PROP_SPAWN_INTERVAL = 2; 
    private readonly EXPLORATION_SPAWN_INTERVAL = 60; 

    private currentSchedule: ISpawnSchedule;

    constructor(private game: Game, scheduleId: string) {
        this.currentSchedule = SPAWN_SCHEDULES[scheduleId] || SPAWN_SCHEDULES['FOREST_NORMAL'];
    }

    update(dt: number) {
        // --- Handle Enemy Spawning Schedule ---
        while (this.nextSpawnEventIndex < this.currentSchedule.events.length && 
               this.game.gameTime >= this.currentSchedule.events[this.nextSpawnEventIndex].time) {
            const event = this.currentSchedule.events[this.nextSpawnEventIndex];
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

        // --- Handle Exploration Point Spawning ---
        this.explorationSpawnTimer += dt;
        if (this.explorationSpawnTimer >= this.EXPLORATION_SPAWN_INTERVAL) {
            this.explorationSpawnTimer = 0;
            // Cap at 2 points
            if (this.game.entityManager.explorationPoints.length < 2) {
                this.spawnExplorationPoint();
            }
        }
    }

    spawnEnemy(type: string, isElite: boolean = false) {
        const data = ENEMY_DATA[type];
        if (!data) return;

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.game.width, this.game.height) / 2 + 50;
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;
        
        // Use pool from EntityManager
        const enemy = this.game.entityManager.enemyPool.get();
        enemy.reset(x, y, data, type, isElite);
        this.game.entityManager.enemies.push(enemy);
    }

    spawnProp() {
        const type = Math.random() > 0.5 ? 'CRATE' : 'BARREL';
        const data = PROP_DATA[type];
        if (!data) return;

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.game.width, this.game.height) / 2 + 100;
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;

        const prop = this.game.entityManager.propPool.get();
        prop.reset(x, y, data);
        this.game.entityManager.props.push(prop);
    }

    spawnItem() {
        const itemType = 'HEALTH_POTION';
        const data = ITEM_DATA[itemType];
        if (!data) return;

        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() * (this.game.width / 3)) + 100; 
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;
        this.game.entityManager.items.push(new Item(x, y, data));
    }

    spawnChestNearPlayer() {
        if (this.game.player) {
            this.game.entityManager.chests.push(new Chest(this.game.player.pos.x + 80, this.game.player.pos.y, CHEST_DATA));
        }
    }

    spawnExplorationPoint() {
        const angle = Math.random() * Math.PI * 2;
        const minDist = 800;
        const maxDist = 1500;
        const radius = minDist + Math.random() * (maxDist - minDist);
        
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;

        this.game.entityManager.explorationPoints.push(new ExplorationPoint(x, y));
    }
}
