
import { IWeaponData } from "../utils/types";

export const WEAPON_DATA: { [key: string]: IWeaponData } = {
    BULLET: {
        id: 'BULLET',
        nameKey: 'weapon.bullet.name',
        icon: '🔫',
        type: 'PROJECTILE',
        damage: 12, // Buffed to ensure 2-shot kill on Slimes (20HP)
        cooldown: 800, // ms
        speed: 400,
        penetration: 1,
        range: 800,
        fireSound: 'WEAPON_BULLET',
        tags: ['PROJECTILE', 'PHYSICAL']
    },
    GATLING_GUN: {
        id: 'GATLING_GUN',
        nameKey: 'weapon.gatling.name',
        icon: '🦾',
        type: 'PROJECTILE',
        damage: 40,
        cooldown: 100, // Very fast
        speed: 550,
        penetration: 2,
        range: 900,
        fireSound: 'WEAPON_BULLET',
        tags: ['PROJECTILE', 'PHYSICAL']
    },
    DOOM_CANNON: {
        id: 'DOOM_CANNON',
        nameKey: 'weapon.doomcannon.name',
        icon: '👹',
        type: 'PROJECTILE',
        damage: 150,
        cooldown: 80, // Extreme speed
        speed: 700,
        penetration: 5,
        range: 1200,
        fireSound: 'WEAPON_BULLET',
        tags: ['PROJECTILE', 'PHYSICAL', 'EXPLOSIVE']
    },
    BOOMERANG: {
        id: 'BOOMERANG',
        nameKey: 'weapon.boomerang.name',
        icon: '🥏',
        type: 'BOOMERANG',
        damage: 75,
        cooldown: 3000,
        speed: 350,
        penetration: 4, // Nerfed from 999 (infinite) to require upgrades
        range: 400, 
        fireSound: 'WEAPON_BOOMERANG',
        tags: ['PROJECTILE', 'PHYSICAL']
    },
    SONIC_DISC: {
        id: 'SONIC_DISC',
        nameKey: 'weapon.sonicdisc.name',
        icon: '💿',
        type: 'BOOMERANG',
        damage: 120,
        cooldown: 2000,
        speed: 600,
        penetration: 999,
        range: 600,
        fireSound: 'WEAPON_BOOMERANG',
        tags: ['PROJECTILE', 'PHYSICAL', 'AREA']
    },
    VOID_EATER: {
        id: 'VOID_EATER',
        nameKey: 'weapon.voideater.name',
        icon: '🌌',
        type: 'BOOMERANG',
        damage: 250,
        cooldown: 1500,
        speed: 500,
        penetration: 999,
        range: 800,
        fireSound: 'WEAPON_BOOMERANG',
        tags: ['PROJECTILE', 'MAGIC', 'DARK', 'AREA']
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
        },
        tags: ['AREA', 'MAGIC', 'FIRE']
    },
    SUPERNOVA: {
        id: 'SUPERNOVA',
        nameKey: 'weapon.supernova.name',
        icon: '🌞',
        type: 'AURA',
        damage: 30,
        cooldown: 500, // Faster tick
        range: 160,
        speed: 0,
        penetration: 999,
        fireSound: 'WEAPON_AURA',
        statusEffect: {
            type: 'BURN',
            chance: 1.0,
            duration: 4000,
            magnitude: 20,
        },
        tags: ['AREA', 'MAGIC', 'FIRE']
    },
    BLACK_HOLE: {
        id: 'BLACK_HOLE',
        nameKey: 'weapon.blackhole.name',
        icon: '🕳️',
        type: 'AURA',
        damage: 100,
        cooldown: 250, // Ultra fast tick
        range: 250,
        speed: 0,
        penetration: 999,
        fireSound: 'WEAPON_AURA',
        statusEffect: {
            type: 'SLOW', // Massive slow
            chance: 1.0,
            duration: 1000,
            magnitude: 0.2, // 80% slow
        },
        tags: ['AREA', 'MAGIC', 'DARK']
    },
    ICE_SHARD: {
        id: 'ICE_SHARD',
        nameKey: 'weapon.iceshard.name',
        icon: '❄️',
        type: 'LASER',
        firePattern: 'forward',
        damage: 12, // Buffed (effective damage due to hit scan) to ensuring hits against Bats
        cooldown: 1200,
        speed: 0, 
        penetration: 999, 
        range: 600,
        width: 10,
        fireSound: 'WEAPON_LASER',
        statusEffect: {
            type: 'SLOW',
            chance: 1.0,
            duration: 2000, // 2 seconds
            magnitude: 0.5, // 50% speed
        },
        tags: ['LASER', 'MAGIC', 'ICE']
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
        tags: ['PROJECTILE', 'MAGIC']
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
        tags: ['AREA', 'MAGIC', 'LIGHTNING']
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
        tags: ['MELEE', 'PHYSICAL']
    }
};
