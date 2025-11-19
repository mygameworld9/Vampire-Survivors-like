
import { ISaveData } from "../utils/types";
import { META_UPGRADES } from "../data/metaUpgradeData";

class ProgressionManager {
    private static instance: ProgressionManager;
    private readonly STORAGE_KEY = 'sparkle_survivors_save_v1';
    private saveData: ISaveData;

    private constructor() {
        this.saveData = this.load();
    }

    public static getInstance(): ProgressionManager {
        if (!ProgressionManager.instance) {
            ProgressionManager.instance = new ProgressionManager();
        }
        return ProgressionManager.instance;
    }

    private load(): ISaveData {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure robust structure
                return {
                    totalGold: parsed.totalGold || 0,
                    upgrades: parsed.upgrades || {}
                };
            }
        } catch (e) {
            console.error("Failed to load save data", e);
        }
        return { totalGold: 0, upgrades: {} };
    }

    public save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.saveData));
        } catch (e) {
            console.error("Failed to save data", e);
        }
    }

    public getGold(): number {
        return this.saveData.totalGold;
    }

    public addGold(amount: number) {
        this.saveData.totalGold += amount;
        this.save();
    }

    public subtractGold(amount: number) {
        this.saveData.totalGold = Math.max(0, this.saveData.totalGold - amount);
        this.save();
    }

    public getUpgradeLevel(id: string): number {
        return this.saveData.upgrades[id] || 0;
    }

    public purchaseUpgrade(id: string): boolean {
        const meta = META_UPGRADES[id];
        if (!meta) return false;

        const currentLevel = this.getUpgradeLevel(id);
        if (currentLevel >= meta.maxLevel) return false;

        const cost = this.getUpgradeCost(id, currentLevel);
        if (this.saveData.totalGold >= cost) {
            this.subtractGold(cost);
            this.saveData.upgrades[id] = currentLevel + 1;
            this.save();
            return true;
        }
        return false;
    }

    public getUpgradeCost(id: string, currentLevel?: number): number {
        const meta = META_UPGRADES[id];
        if (!meta) return 0;
        const level = currentLevel !== undefined ? currentLevel : this.getUpgradeLevel(id);
        // Cost formula: base * (multiplier ^ level)
        return Math.floor(meta.baseCost * Math.pow(meta.costMultiplier, level));
    }

    public getPlayerBonuses() {
        const bonuses = {
            damageMultiplier: 0,
            maxHpAdd: 0,
            speedMultiplier: 0,
            hpRegenAdd: 0,
            goldMultiplier: 0,
            revivesAdd: 0
        };

        for (const key in META_UPGRADES) {
            const meta = META_UPGRADES[key];
            const level = this.getUpgradeLevel(key);
            if (level > 0) {
                const totalValue = level * meta.valuePerLevel;
                switch (meta.stat) {
                    case 'damage': bonuses.damageMultiplier += totalValue; break;
                    case 'maxHp': bonuses.maxHpAdd += totalValue; break;
                    case 'speed': bonuses.speedMultiplier += totalValue; break;
                    case 'hpRegen': bonuses.hpRegenAdd += totalValue; break;
                    case 'goldGain': bonuses.goldMultiplier += totalValue; break;
                    case 'revives': bonuses.revivesAdd += totalValue; break;
                }
            }
        }
        return bonuses;
    }
}

export const progressionManager = ProgressionManager.getInstance();
