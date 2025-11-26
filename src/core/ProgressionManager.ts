
import { ISaveData } from "../utils/types";
import { META_UPGRADES } from "../data/metaUpgradeData";

/**
 * Manages all player meta-progression, including currency and permanent upgrades.
 * It handles loading and saving player data to local storage and calculates player bonuses.
 * This class is implemented as a Singleton to ensure a single source of truth for progression data.
 */
class ProgressionManager {
    /** @private The singleton instance of the ProgressionManager. */
    private static instance: ProgressionManager;
    /** @private The key used to store save data in local storage. */
    private readonly STORAGE_KEY = 'sparkle_survivors_save_v1';
    /** @private The in-memory representation of the player's save data. */
    private saveData: ISaveData;

    /** @private Creates a new ProgressionManager instance and loads existing data. */
    private constructor() {
        this.saveData = this.load();
    }

    /**
     * Gets the singleton instance of the ProgressionManager.
     * @returns {ProgressionManager} The singleton instance.
     */
    public static getInstance(): ProgressionManager {
        if (!ProgressionManager.instance) {
            ProgressionManager.instance = new ProgressionManager();
        }
        return ProgressionManager.instance;
    }

    /**
     * Loads the player's save data from local storage.
     * If no data is found, it initializes with default values.
     * @private
     * @returns {ISaveData} The loaded or initialized save data.
     */
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

    /**
     * Saves the current progression data to local storage.
     */
    public save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.saveData));
        } catch (e) {
            console.error("Failed to save data", e);
        }
    }

    /**
     * Gets the total amount of gold the player has.
     * @returns {number} The player's total gold.
     */
    public getGold(): number {
        return this.saveData.totalGold;
    }

    /**
     * Adds a specified amount of gold to the player's total.
     * @param {number} amount - The amount of gold to add.
     */
    public addGold(amount: number) {
        this.saveData.totalGold += amount;
        this.save();
    }

    /**
     * Subtracts a specified amount of gold from the player's total.
     * @param {number} amount - The amount of gold to subtract.
     */
    public subtractGold(amount: number) {
        this.saveData.totalGold = Math.max(0, this.saveData.totalGold - amount);
        this.save();
    }

    /**
     * Gets the current level of a specific meta upgrade.
     * @param {string} id - The ID of the upgrade.
     * @returns {number} The current level of the upgrade (0 if not purchased).
     */
    public getUpgradeLevel(id: string): number {
        return this.saveData.upgrades[id] || 0;
    }

    /**
     * Attempts to purchase the next level of a meta upgrade.
     * It checks if the player has enough gold and if the upgrade is not maxed out.
     * If successful, it deducts the cost and updates the upgrade level.
     * @param {string} id - The ID of the upgrade to purchase.
     * @returns {boolean} True if the purchase was successful, false otherwise.
     */
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

    /**
     * Calculates the cost of the next level for a specific meta upgrade.
     * @param {string} id - The ID of the upgrade.
     * @param {number} [currentLevel] - Optional: The current level to calculate from. If not provided, the saved level is used.
     * @returns {number} The cost of the next upgrade level.
     */
    public getUpgradeCost(id: string, currentLevel?: number): number {
        const meta = META_UPGRADES[id];
        if (!meta) return 0;
        const level = currentLevel !== undefined ? currentLevel : this.getUpgradeLevel(id);
        // Cost formula: base * (multiplier ^ level)
        return Math.floor(meta.baseCost * Math.pow(meta.costMultiplier, level));
    }

    /**
     * Calculates and aggregates all stat bonuses from purchased meta upgrades.
     * @returns {object} An object containing all player bonuses (e.g., damageMultiplier, maxHpAdd).
     */
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
