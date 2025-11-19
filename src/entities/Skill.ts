import { ISkillData, UpgradeEffect, AnyUpgradeEffect } from "../utils/types";
import { getSkillUpgradeDataFor } from "../data/upgradeLoader";
import { Player } from "./Player";
import { i18nManager } from "../core/i18n";

export type SkillEffect = {
    type: 'PULSE';
    damage: number;
    range: number;
};

export class Skill {
    id: string;
    nameKey: string;
    type: 'ACTIVE' | 'PASSIVE';
    level: number = 1;
    icon: string;

    // Active skill properties
    damage?: number;
    cooldown?: number;
    range?: number;
    private cooldownTimer: number = 0;

    // Passive skill properties
    effects?: { [key: string]: UpgradeEffect };
    
    constructor(data: ISkillData) {
        this.id = data.id;
        this.nameKey = data.nameKey;
        this.type = data.type;
        this.icon = data.icon;

        if (this.type === 'ACTIVE') {
            this.damage = data.damage;
            this.cooldown = data.cooldown;
            this.range = data.range;
            this.cooldownTimer = this.cooldown || 0;
        } else { // PASSIVE
            this.effects = data.effects;
        }
    }

    get name(): string {
        return i18nManager.t(this.nameKey);
    }

    update(dt: number): SkillEffect | null {
        if (this.type === 'ACTIVE' && this.cooldown) {
            this.cooldownTimer -= dt * 1000;
            if (this.cooldownTimer <= 0) {
                this.cooldownTimer = this.cooldown;
                return { type: 'PULSE', damage: this.damage!, range: this.range! };
            }
        }
        return null;
    }
    
    levelUp(player: Player) {
        const upgradePath = getSkillUpgradeDataFor(this.id);
        if (!upgradePath) return;

        const upgradeData = upgradePath[this.level - 1];
        if (upgradeData) {
            for (const key in upgradeData.effects) {
                const effect = upgradeData.effects[key];
                
                if (this.type === 'PASSIVE') {
                    // For passive skills, we need to apply the effect directly to the player
                    // FIX: Type guard to ensure effect is compatible with `applyPassiveEffect` which expects a numeric operation.
                    // This resolves the error where `AnyUpgradeEffect` (which can be string-based) is not assignable to `UpgradeEffect`.
                    if (effect.op === 'add' || effect.op === 'multiply') {
                        player.applyPassiveEffect({[key]: effect});
                    }
                } else {
                     // For active skills, update the skill's own properties
                    switch (key) {
                        case 'damage':
                        case 'cooldown':
                        case 'range':
                            if (this[key] !== undefined) {
                                if (effect.op === 'add') (this as any)[key] += effect.value;
                                if (effect.op === 'multiply') (this as any)[key] *= effect.value;
                            }
                            break;
                    }
                }
            }
            this.level++;
        }
    }

    getCurrentUpgradeDescription(): string {
       const upgradePath = getSkillUpgradeDataFor(this.id);
       if (!upgradePath || this.level > upgradePath.length) return i18nManager.t('ui.maxLevel');
       
       const descriptionKey = upgradePath[this.level - 1]?.descriptionKey;
       return descriptionKey ? i18nManager.t(descriptionKey) : i18nManager.t('ui.maxLevel');
    }

    isMaxLevel(): boolean {
        const upgradePath = getSkillUpgradeDataFor(this.id);
        if (!upgradePath) return true;
        return this.level > upgradePath.length;
    }
}