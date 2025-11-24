
import { IWeaponData } from "../utils/types";

export const WEAPON_DATA: { [key: string]: IWeaponData } = {
    BULLET: {
        id: 'BULLET',
        nameKey: 'weapon.bullet.name',
        icon: '🔫',
        type: 'PROJECTILE',
        damage: 36,
        cooldown: 800, // ms
        speed: 400,
        penetration: 1,
        range: 800,
        fireSound: 'WEAPON_BULLET',
    },
    BOOMERANG: {
        id: 'BOOMERANG',
        nameKey: 'weapon.boomerang.name',
        icon: '🐿️',
        type: 'BOOMERANG',
        damage: 75,
        cooldown: 3000,
        speed: 350,
        penetration: 999, // Can hit many enemies
        range: 400, // Half a screen's width approx
        fireSound: 'WEAPON_BOOMERANG',
    },
    SUNFIRE: {
        id: 'SUNFIRE',
        nameKey: 'weapon.sunfire.name',
        icon: '🔥',
        type: 'AURA',
        damage: 15,
        cooldown: 1000, // Damage tick rate
        range: 100, // Radius
        speed: 0, // Not applicable
        penetration: 999, // Not applicable
        fireSound: 'WEAPON_AURA',
        statusEffect: {
            type: 'BURN',
            chance: 1.0,
            duration: 3000, // 3 seconds
            magnitude: 5, // 5 dps
        }
    },
    ICE_SHARD: {
        id: 'ICE_SHARD',
        nameKey: 'weapon.iceshard.name',
        icon: '❄️',
        type: 'LASER',
        firePattern: 'forward',
        damage: 24,
        cooldown: 1200,
        speed: 0, // Lasers are instant
        penetration: 999, // "all"
        range: 600,
        width: 10,
        fireSound: 'WEAPON_LASER',
        statusEffect: {
            type: 'SLOW',
            chance: 1.0,
            duration: 2000, // 2 seconds
            magnitude: 0.5, // 50% speed
        }
    },
    MAGIC_MISSILE: {
        id: 'MAGIC_MISSILE',
        nameKey: 'weapon.magicmissile.name',
        icon: '🔮',
        type: 'HOMING_PROJECTILE',
        damage: 36,
        cooldown: 1500,
        speed: 300,
        penetration: 1,
        range: 5000, // Failsafe range
        fireSound: 'WEAPON_LASER', // Reusing sound for now
    },
    THUNDER_STAFF: {
        id: 'THUNDER_STAFF',
        nameKey: 'weapon.thunderstaff.name',
        icon: '⚡',
        type: 'LIGHTNING',
        damage: 50,
        cooldown: 3000,
        speed: 0, // Instant
        penetration: 1, // Number of targets
        range: 100, // Explosion Radius
        fireSound: 'WEAPON_LIGHTNING',
    },
    KATANA: {
        id: 'KATANA',
        nameKey: 'weapon.katana.name',
        icon: '🗡️',
        type: 'MELEE',
        damage: 45,
        cooldown: 1500,
        speed: 0, 
        penetration: 999,
        range: 80, // Slash radius
        fireSound: 'WEAPON_SLASH',
    }
};
