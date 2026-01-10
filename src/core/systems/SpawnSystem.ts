
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
import { FloatingText } from "../../entities/FloatingText";
import { i18nManager } from "../i18n";
import { EnemyRegistry } from "../EnemyRegistry";

const ELITE_SPAWN_START_TIME = 300; // 5 minutes
const ELITE_SPAWN_CHANCE = 0.1; // 10% chance
const ENEMY_CAP = 300; // Max enemies to prevent lag

type MapEventType = 'NONE' | 'SIEGE' | 'TREASURE_HUNT' | 'SHRINE_SPAWN';

export class SpawnSystem {
    private spawnManager: { [type: string]: { rate: number, timer: number } } = {};
    private nextSpawnEventIndex = 0;

    // Sub-timers
    private itemSpawnTimer = 0;
    private propSpawnTimer = 0;
    private explorationSpawnTimer = 45;

    private readonly ITEM_SPAWN_INTERVAL = 15;
    private readonly PROP_SPAWN_INTERVAL = 2;
    private readonly EXPLORATION_SPAWN_INTERVAL = 60;

    private currentSchedule: ISpawnSchedule;

    // --- Event System State ---
    private currentEvent: MapEventType = 'NONE';
    private eventTimer = 0;
    private timeUntilNextEvent = 60; // 60s initial safety
    private activeSiegeType: string | null = null;

    constructor(private game: Game, scheduleId: string) {
        this.currentSchedule = SPAWN_SCHEDULES[scheduleId] || SPAWN_SCHEDULES['FOREST_NORMAL'];
    }

    update(dt: number) {
        // --- 1. Global Cap Check ---
        const currentEnemyCount = this.game.entityManager.enemies.length;
        if (currentEnemyCount >= ENEMY_CAP) {
            // Skip spawning logic if we are at capacity
            return;
        }

        // --- 2. Update Map Events ---
        this.updateEvents(dt);

        // --- 3. Normal Schedule Spawning ---
        // Only run normal schedule if NOT in a Siege (Siege replaces normal spawns to focus chaos)
        if (this.currentEvent !== 'SIEGE') {
            this.updateNormalSchedule(dt);
        }

        // --- 4. Sub-Spawns ---
        this.updateSubSpawns(dt);
    }

    private updateEvents(dt: number) {
        if (this.currentEvent !== 'NONE') {
            // Event in progress
            this.eventTimer -= dt;

            // Event Logic Per Frame
            if (this.currentEvent === 'SIEGE') {
                this.handleSiegeSpawn(dt);
            }

            if (this.eventTimer <= 0) {
                this.endCurrentEvent();
            }
        } else {
            // Waiting for next event
            this.timeUntilNextEvent -= dt;
            if (this.timeUntilNextEvent <= 0) {
                this.triggerRandomEvent();
            }
        }
    }

    private triggerRandomEvent() {
        const roll = Math.random();

        // 50% Siege, 30% Treasure, 20% Shrine
        if (roll < 0.5) {
            this.startSiege();
        } else if (roll < 0.8) {
            this.startTreasureHunt();
        } else {
            this.startShrineSpawn();
        }

        // Reset cooldown (45 - 90 seconds random)
        this.timeUntilNextEvent = 45 + Math.random() * 45;
    }

    // --- EVENT: SIEGE ---
    private startSiege() {
        this.currentEvent = 'SIEGE';
        this.eventTimer = 15; // 15 seconds duration

        // Determine siege unit type based on game time
        if (this.game.gameTime < 120) this.activeSiegeType = 'BAT';
        else if (this.game.gameTime < 300) this.activeSiegeType = 'SPIDER';
        else this.activeSiegeType = 'GHOST';

        this.announceEvent(i18nManager.t('event.siege'), '#ef5350'); // Red warning
    }

    private handleSiegeSpawn(dt: number) {
        // High spawn rate: 10 per second approx
        // We use a local probability instead of a timer for chaos
        if (Math.random() < dt * 10 && this.activeSiegeType) {
            this.spawnEnemy(this.activeSiegeType, false);
        }
    }

    // --- EVENT: TREASURE HUNT ---
    private startTreasureHunt() {
        if (!this.game.player || !this.game.player.pos) return;

        this.currentEvent = 'TREASURE_HUNT';
        this.eventTimer = 5; // Short duration just to spawn them

        this.announceEvent(i18nManager.t('event.treasure'), '#FFD700'); // Gold text

        // Spawn 3-5 Goblins
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            // Spawn near player
            const angle = Math.random() * Math.PI * 2;
            const dist = 300 + Math.random() * 200;
            const x = this.game.player.pos.x + Math.cos(angle) * dist;
            const y = this.game.player.pos.y + Math.sin(angle) * dist;

            const enemy = this.game.entityManager.enemyPool.get();
            const isElite = Math.random() < 0.1; // Small chance for Mega Goblin
            const data = ENEMY_DATA['TREASURE_GOBLIN'];
            if (data) {
                enemy.reset(x, y, data, 'TREASURE_GOBLIN', isElite);
                EnemyRegistry.register(enemy);
                this.game.entityManager.enemies.push(enemy);
            }
        }
    }

    // --- EVENT: SHRINE SPAWN ---
    private startShrineSpawn() {
        this.currentEvent = 'SHRINE_SPAWN';
        this.eventTimer = 2;

        this.announceEvent(i18nManager.t('event.shrine'), '#00BCD4'); // Cyan text

        // Force spawn one nearby
        this.spawnExplorationPoint(true);
    }

    private endCurrentEvent() {
        this.currentEvent = 'NONE';
        this.activeSiegeType = null;
    }

    private announceEvent(text: string, color: string) {
        if (this.game.player && this.game.player.pos) {
            this.game.entityManager.floatingTexts.push(
                new FloatingText(this.game.player.pos.x, this.game.player.pos.y - 100, text, color, 3.0)
            );
            this.game.soundManager.playSound('LEVEL_UP'); // Use an impactful sound
        }
    }

    // --- Standard Logic ---

    private updateNormalSchedule(dt: number) {
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
    }

    private updateSubSpawns(dt: number) {
        // Items
        this.itemSpawnTimer += dt;
        if (this.itemSpawnTimer >= this.ITEM_SPAWN_INTERVAL) {
            this.itemSpawnTimer = 0;
            this.spawnItem();
        }

        // Props
        this.propSpawnTimer += dt;
        if (this.propSpawnTimer >= this.PROP_SPAWN_INTERVAL) {
            this.propSpawnTimer = 0;
            this.spawnProp();
        }

        // Exploration Points (Natural spawn)
        this.explorationSpawnTimer += dt;
        if (this.explorationSpawnTimer >= this.EXPLORATION_SPAWN_INTERVAL) {
            this.explorationSpawnTimer = 0;
            if (this.game.entityManager.explorationPoints.length < 2) {
                this.spawnExplorationPoint();
            }
        }
    }

    spawnEnemy(type: string, isElite: boolean = false) {
        if (!this.game.player || !this.game.player.pos) return;
        const data = ENEMY_DATA[type];
        if (!data) return;

        const angle = Math.random() * Math.PI * 2;
        // Spawn slightly outside view usually, but Siege might be closer/screen edge?
        // Standard radius:
        const radius = Math.max(this.game.width, this.game.height) / 2 + 50;
        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;

        // Use pool from EntityManager
        const enemy = this.game.entityManager.enemyPool.get();
        enemy.reset(x, y, data, type, isElite);
        EnemyRegistry.register(enemy);
        this.game.entityManager.enemies.push(enemy);
    }

    spawnProp() {
        if (!this.game.player || !this.game.player.pos) return;
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
        if (!this.game.player || !this.game.player.pos) return;
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
        if (this.game.player && this.game.player.pos) {
            this.game.entityManager.chests.push(new Chest(this.game.player.pos.x + 80, this.game.player.pos.y, CHEST_DATA));
        }
    }

    spawnExplorationPoint(nearPlayer: boolean = false) {
        if (!this.game.player || !this.game.player.pos) return;
        const angle = Math.random() * Math.PI * 2;
        let radius = 0;

        if (nearPlayer) {
            // Spawn close (visible on screen usually)
            radius = 300 + Math.random() * 200;
        } else {
            // Spawn far
            const minDist = 800;
            const maxDist = 1500;
            radius = minDist + Math.random() * (maxDist - minDist);
        }

        const x = this.game.player.pos.x + Math.cos(angle) * radius;
        const y = this.game.player.pos.y + Math.sin(angle) * radius;

        this.game.entityManager.explorationPoints.push(new ExplorationPoint(x, y));
    }
}
