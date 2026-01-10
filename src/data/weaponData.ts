
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
        damage: 22,            // Nerfed from 40: Target ~30 DPS (2x Bullet)
        cooldown: 350,         // Nerfed from 150: Slower than before
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
        damage: 80,            // Nerfed from 150: Target ~53 DPS (1.8x Gatling)
        cooldown: 900,         // Slowed from 800: More deliberate feel
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
        damage: 180, // Balanced: Tier 3 should be ~2.5x Tier 2, not 3x
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
            chance: 0.8,       // Tier 1: 80% trigger rate
            duration: 3000,
            magnitude: 5,
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
            chance: 0.9,       // Tier 2: 90% trigger rate
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
        cooldown: 400, // Balanced: ~250 DPS (was 400 DPS at 250ms)
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
            chance: 0.8,       // Tier 1: 80% trigger rate
            duration: 2000,
            magnitude: 0.5,
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
    },

    // ========== NEW WEAPONS v2.0 ==========

    // === 毒系武器线 (Poison Line) ===
    POISON_DAGGER: {
        id: 'POISON_DAGGER',
        nameKey: 'weapon.poisondagger.name',
        icon: '🗡️',
        type: 'MELEE',
        damage: 25,
        cooldown: 1200,
        speed: 0,
        penetration: 3,
        range: 60,
        fireSound: 'WEAPON_SLASH',
        statusEffect: {
            type: 'POISON',
            chance: 0.8,       // Tier 1: 80% trigger rate
            duration: 4000,
            magnitude: 3,
        },
        tags: ['MELEE', 'PHYSICAL', 'POISON']
    },
    VENOM_FANG: {
        id: 'VENOM_FANG',
        nameKey: 'weapon.venomfang.name',
        icon: '🐍',
        type: 'MELEE',
        damage: 65, // Adjusted from 50 per numerical verification
        cooldown: 900, // Adjusted from 1000 per numerical verification
        speed: 0,
        penetration: 6,
        range: 90,
        fireSound: 'WEAPON_SLASH',
        statusEffect: {
            type: 'POISON',
            chance: 0.9,       // Tier 2: 90% trigger rate
            duration: 5000,
            magnitude: 8,
        },
        tags: ['MELEE', 'PHYSICAL', 'POISON']
    },
    PLAGUE_SCYTHE: {
        id: 'PLAGUE_SCYTHE',
        nameKey: 'weapon.plaguescythe.name',
        icon: '☠️',
        type: 'MELEE',
        damage: 120, // Adjusted from 100 per numerical verification
        cooldown: 700, // Adjusted from 800 per numerical verification
        speed: 0,
        penetration: 999,
        range: 140,
        fireSound: 'WEAPON_SLASH',
        statusEffect: {
            type: 'POISON',
            chance: 1.0,
            duration: 6000,
            magnitude: 15, // 15 DPS, spreads on kill
        },
        tags: ['MELEE', 'MAGIC', 'POISON', 'AREA']
    },

    // === 召唤系武器线 (Summoning Line) ===
    SPIRIT_ORB: {
        id: 'SPIRIT_ORB',
        nameKey: 'weapon.spiritorb.name',
        icon: '👻',
        type: 'ORBITING',
        damage: 8,
        cooldown: 600,
        speed: 90,
        penetration: 1,            // CHANGED: 1 = disappear on first hit
        range: 80,
        maxProjectiles: 10,        // CHANGED: Max 10 orbs at a time
        fireSound: 'WEAPON_AURA',
        tags: ['AREA', 'MAGIC', 'SUMMON']
    },
    PHANTOM_GUARD: {
        id: 'PHANTOM_GUARD',
        nameKey: 'weapon.phantomguard.name',
        icon: '👁️',
        type: 'ORBITING',
        damage: 15,
        cooldown: 500,
        speed: 120,
        penetration: 2,            // Can hit 2 enemies before disappearing
        range: 120,
        maxProjectiles: 12,
        fireSound: 'WEAPON_AURA',
        tags: ['AREA', 'MAGIC', 'SUMMON']
    },
    SOUL_VORTEX: {
        id: 'SOUL_VORTEX',
        nameKey: 'weapon.soulvortex.name',
        icon: '🌀',
        type: 'ORBITING',
        damage: 25,
        cooldown: 400,
        speed: 180,
        penetration: 3,            // Can hit 3 enemies before disappearing
        range: 180,
        maxProjectiles: 15,
        fireSound: 'WEAPON_AURA',
        tags: ['AREA', 'MAGIC', 'DARK', 'SUMMON']
    },

    // === 链式武器线 (Chain Line) ===
    CHAIN_BOLT: {
        id: 'CHAIN_BOLT',
        nameKey: 'weapon.chainbolt.name',
        icon: '⛓️',
        type: 'CHAIN',
        damage: 20,
        cooldown: 2000,
        speed: 400,
        bounceCount: 2,        // NEW: Explicit bounce count
        penetration: 1,        // Enemies hit per bounce
        range: 150,            // Bounce search range
        fireSound: 'WEAPON_LIGHTNING',
        tags: ['PROJECTILE', 'MAGIC']
    },
    SHOCK_CHAIN: {
        id: 'SHOCK_CHAIN',
        nameKey: 'weapon.shockchain.name',
        icon: '⚡',
        type: 'CHAIN',
        damage: 45,            // Nerfed from 55: ~2.25x Tier 1
        cooldown: 1500,
        speed: 500,
        bounceCount: 4,        // NEW: Explicit bounce count
        penetration: 1,
        range: 200,
        fireSound: 'WEAPON_LIGHTNING',
        statusEffect: {
            type: 'STUN',
            chance: 0.9,       // Tier 2: 90% trigger rate
            duration: 300,
            magnitude: 1,
        },
        tags: ['PROJECTILE', 'MAGIC', 'LIGHTNING']
    },
    STORM_WEAVER: {
        id: 'STORM_WEAVER',
        nameKey: 'weapon.stormweaver.name',
        icon: '🌩️',
        type: 'CHAIN',
        damage: 55,            // Nerfed from 60: ~1.2x Tier 2
        cooldown: 1200,
        speed: 600,
        bounceCount: 5,        // NEW: Explicit bounce count
        penetration: 1,
        range: 250,
        fireSound: 'WEAPON_LIGHTNING',
        statusEffect: {
            type: 'STUN',
            chance: 1.0,       // Tier 3: 100% trigger rate
            duration: 500,
            magnitude: 1,
        },
        tags: ['PROJECTILE', 'MAGIC', 'LIGHTNING', 'AREA']
    },

    // === 陷阱系武器线 (Trap Line) ===
    SPIKE_TRAP: {
        id: 'SPIKE_TRAP',
        nameKey: 'weapon.spiketrap.name',
        icon: '📌',
        type: 'TRAP',
        damage: 30,
        cooldown: 3000, // Place interval
        speed: 0,
        penetration: 5, // Max traps on field
        range: 40, // Trap radius
        fireSound: 'WEAPON_SLASH',
        tags: ['TRAP', 'PHYSICAL']
    },
    FROST_MINE: {
        id: 'FROST_MINE',
        nameKey: 'weapon.frostmine.name',
        icon: '💎',
        type: 'TRAP',
        damage: 50,
        cooldown: 2500,
        speed: 0,
        penetration: 6, // Max traps
        range: 60, // Trap radius, 100px explosion
        fireSound: 'WEAPON_LASER',
        statusEffect: {
            type: 'SLOW',
            chance: 1.0,
            duration: 3000,
            magnitude: 0.4, // 60% slow
        },
        tags: ['TRAP', 'MAGIC', 'ICE', 'AREA']
    },
    VOID_RIFT: {
        id: 'VOID_RIFT',
        nameKey: 'weapon.voidrift.name',
        icon: '🌑',
        type: 'TRAP',
        damage: 25, // Per second DOT
        cooldown: 4000,
        speed: 30, // Pull strength
        penetration: 3, // Max rifts
        range: 100, // Rift radius
        fireSound: 'WEAPON_AURA',
        tags: ['TRAP', 'MAGIC', 'DARK', 'AREA']
    },

    // === 独立武器进化 (Independent Evolutions) ===
    FROST_STORM: {
        id: 'FROST_STORM',
        nameKey: 'weapon.froststorm.name',
        icon: '🌨️',
        type: 'LASER',
        firePattern: 'forward', // Will shoot 3 lasers
        damage: 30,
        cooldown: 800,
        speed: 0,
        penetration: 999,
        range: 800,
        width: 10,
        fireSound: 'WEAPON_LASER',
        statusEffect: {
            type: 'SLOW',
            chance: 1.0,
            duration: 3000,
            magnitude: 0.3, // 70% slow
        },
        tags: ['LASER', 'MAGIC', 'ICE']
    },
    ARCANE_SWARM: {
        id: 'ARCANE_SWARM',
        nameKey: 'weapon.arcaneswarm.name',
        icon: '💫',
        type: 'HOMING_PROJECTILE',
        damage: 25,
        cooldown: 800,
        speed: 350,
        penetration: 2,
        range: 5000,
        fireSound: 'WEAPON_LASER',
        tags: ['PROJECTILE', 'MAGIC']
    },
    CHAIN_LIGHTNING: {
        id: 'CHAIN_LIGHTNING',
        nameKey: 'weapon.chainlightning.name',
        icon: '🌩️',
        type: 'LIGHTNING',
        damage: 80,
        cooldown: 2000,
        speed: 0,
        penetration: 5, // Chain targets
        range: 150, // Explosion radius
        fireSound: 'WEAPON_LIGHTNING',
        tags: ['AREA', 'MAGIC', 'LIGHTNING']
    },
    SHADOW_BLADE: {
        id: 'SHADOW_BLADE',
        nameKey: 'weapon.shadowblade.name',
        icon: '⚔️',
        type: 'MELEE',
        damage: 90,
        cooldown: 800,
        speed: 0,
        penetration: 999,
        range: 120,
        fireSound: 'WEAPON_SLASH',
        tags: ['MELEE', 'PHYSICAL', 'DARK']
    }
};
