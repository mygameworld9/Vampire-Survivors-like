
import { UpgradeLevel } from "../utils/types";

export const UPGRADE_DATA: { [key: string]: UpgradeLevel[] } = {
    BULLET: [
      { "descriptionKey": "upgrade.bullet.1", "effects": { "penetration": { "op": "add", "value": 1 } } },
      { "descriptionKey": "upgrade.bullet.2", "effects": { "damage": { "op": "add", "value": 5 } } },
      { "descriptionKey": "upgrade.bullet.3", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.bullet.4", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.bullet.5", "effects": { "penetration": { "op": "add", "value": 1 } } },
      { "descriptionKey": "upgrade.bullet.6", "effects": { "damage": { "op": "add", "value": 20 } } }, // Replaced CD reduction with heavy Damage buff (Lvl 7)
      { "descriptionKey": "upgrade.bullet.7", "effects": { "damage": { "op": "add", "value": 15 } } },
      { "descriptionKey": "upgrade.max.stats", "effects": { "damage": { "op": "multiply", "value": 1.2 } } } 
    ],
    BOOMERANG: [
      { "descriptionKey": "upgrade.boomerang.1", "effects": { "penetration": { "op": "add", "value": 2 } } }, // Lvl 2: Compensate base nerf
      { "descriptionKey": "upgrade.boomerang.2", "effects": { "damage": { "op": "add", "value": 10 } } }, // Lvl 3: Dmg
      { "descriptionKey": "upgrade.boomerang.3", "effects": { "range": { "op": "multiply", "value": 1.25 } } }, // Lvl 4: Range
      { "descriptionKey": "upgrade.boomerang.4", "effects": { "penetration": { "op": "add", "value": 999 } } }, // Lvl 5: Infinite Pen Spike
      { "descriptionKey": "upgrade.boomerang.5", "effects": { "cooldown": { "op": "multiply", "value": 0.80 } } }, // Lvl 6: CD
      { "descriptionKey": "upgrade.max.stats", "effects": { "damage": { "op": "multiply", "value": 1.2 } } }
    ],
    SUNFIRE: [
      { "descriptionKey": "upgrade.sunfire.1", "effects": { "damage": { "op": "add", "value": 5 } } },
      { "descriptionKey": "upgrade.sunfire.2", "effects": { "range": { "op": "multiply", "value": 1.15 } } },
      { "descriptionKey": "upgrade.sunfire.3", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.sunfire.4", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.sunfire.5", "effects": { "range": { "op": "multiply", "value": 1.20 } } },
      { "descriptionKey": "upgrade.sunfire.6", "effects": { "cooldown": { "op": "multiply", "value": 0.85 } } },
      { "descriptionKey": "upgrade.sunfire.7", "effects": { "range": { "op": "multiply", "value": 1.20 } } },
      { "descriptionKey": "upgrade.sunfire.8", "effects": { "damage": { "op": "add", "value": 15 } } },
      { "descriptionKey": "upgrade.max.stats", "effects": { "damage": { "op": "multiply", "value": 1.2 } } }
    ],
    // --- TIER 2 UPGRADES ---
    GATLING_GUN: [
        { "descriptionKey": "upgrade.gatling.1", "effects": { "damage": { "op": "add", "value": 10 } } },
        { "descriptionKey": "upgrade.gatling.2", "effects": { "penetration": { "op": "add", "value": 1 } } },
        { "descriptionKey": "upgrade.gatling.3", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
        { "descriptionKey": "upgrade.gatling.4", "effects": { "damage": { "op": "add", "value": 20 } } },
        { "descriptionKey": "upgrade.max.stats", "effects": { "damage": { "op": "multiply", "value": 1.2 } } }
    ],
    SONIC_DISC: [
        { "descriptionKey": "upgrade.sonicdisc.1", "effects": { "range": { "op": "multiply", "value": 1.2 } } },
        { "descriptionKey": "upgrade.sonicdisc.2", "effects": { "damage": { "op": "add", "value": 20 } } },
        { "descriptionKey": "upgrade.sonicdisc.3", "effects": { "cooldown": { "op": "multiply", "value": 0.8 } } },
        { "descriptionKey": "upgrade.sonicdisc.4", "effects": { "damage": { "op": "add", "value": 30 } } },
        { "descriptionKey": "upgrade.max.stats", "effects": { "damage": { "op": "multiply", "value": 1.2 } } }
    ],
    SUPERNOVA: [
        { "descriptionKey": "upgrade.supernova.1", "effects": { "range": { "op": "multiply", "value": 1.2 } } },
        { "descriptionKey": "upgrade.supernova.2", "effects": { "damage": { "op": "add", "value": 10 } } },
        { "descriptionKey": "upgrade.supernova.3", "effects": { "cooldown": { "op": "multiply", "value": 0.8 } } },
        { "descriptionKey": "upgrade.supernova.4", "effects": { "damage": { "op": "add", "value": 20 } } },
        { "descriptionKey": "upgrade.max.stats", "effects": { "damage": { "op": "multiply", "value": 1.2 } } }
    ],
    
    // --- EXISTING WEAPONS ---
    ICE_SHARD: [
      { "descriptionKey": "upgrade.iceshard.1", "effects": { "firePattern": { "op": "set", "value": "forward_backward" } } },
      { "descriptionKey": "upgrade.iceshard.2", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.iceshard.3", "effects": { "firePattern": { "op": "set", "value": "cardinal" } } },
      { "descriptionKey": "upgrade.iceshard.4", "effects": { "range": { "op": "add", "value": 100 } } },
      { "descriptionKey": "upgrade.iceshard.5", "effects": { "damage": { "op": "add", "value": 15 } } },
      { "descriptionKey": "upgrade.iceshard.6", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.iceshard.7", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.max.stats", "effects": { "firePattern": { "op": "set", "value": "all_8" }, "cooldown": { "op": "multiply", "value": 0.6 } } } 
    ],
    MAGIC_MISSILE: [
      { "descriptionKey": "upgrade.magicmissile.1", "effects": { "damage": { "op": "add", "value": 8 } } },
      { "descriptionKey": "upgrade.magicmissile.2", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.magicmissile.3", "effects": { "speed": { "op": "add", "value": 50 } } },
      { "descriptionKey": "upgrade.magicmissile.4", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.magicmissile.5", "effects": { "cooldown": { "op": "multiply", "value": 0.85 } } },
      { "descriptionKey": "upgrade.max.stats", "effects": { "cooldown": { "op": "multiply", "value": 0.2 }, "damage": { "op": "multiply", "value": 0.8 } } }
    ],
    THUNDER_STAFF: [
        { "descriptionKey": "upgrade.thunderstaff.1", "effects": { "penetration": { "op": "add", "value": 1 } } }, 
        { "descriptionKey": "upgrade.thunderstaff.2", "effects": { "damage": { "op": "add", "value": 15 } } },
        { "descriptionKey": "upgrade.thunderstaff.3", "effects": { "range": { "op": "multiply", "value": 1.25 } } },
        { "descriptionKey": "upgrade.thunderstaff.4", "effects": { "penetration": { "op": "add", "value": 1 } } },
        { "descriptionKey": "upgrade.thunderstaff.5", "effects": { "cooldown": { "op": "multiply", "value": 0.8 } } },
        { "descriptionKey": "upgrade.thunderstaff.6", "effects": { "damage": { "op": "add", "value": 20 } } },
        { "descriptionKey": "upgrade.thunderstaff.7", "effects": { "penetration": { "op": "add", "value": 2 } } },
        { "descriptionKey": "upgrade.max.stats", "effects": { "penetration": { "op": "add", "value": 5 }, "range": { "op": "multiply", "value": 1.5 } } }
    ],
    KATANA: [
        { "descriptionKey": "upgrade.katana.1", "effects": { "damage": { "op": "add", "value": 10 } } },
        { "descriptionKey": "upgrade.katana.2", "effects": { "range": { "op": "multiply", "value": 1.2 } } },
        { "descriptionKey": "upgrade.katana.3", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
        { "descriptionKey": "upgrade.katana.4", "effects": { "damage": { "op": "add", "value": 15 } } },
        { "descriptionKey": "upgrade.katana.5", "effects": { "range": { "op": "multiply", "value": 1.2 } } },
        { "descriptionKey": "upgrade.katana.6", "effects": { "cooldown": { "op": "multiply", "value": 0.8 } } },
        { "descriptionKey": "upgrade.max.stats", "effects": { "firePattern": { "op": "set", "value": "all_8" }, "cooldown": { "op": "multiply", "value": 0.5 } } } 
    ]
};
