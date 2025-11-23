import { UpgradeLevel } from "../utils/types";

export const UPGRADE_DATA: { [key: string]: UpgradeLevel[] } = {
    BULLET: [
      { "descriptionKey": "upgrade.bullet.1", "effects": { "penetration": { "op": "add", "value": 1 } } },
      { "descriptionKey": "upgrade.bullet.2", "effects": { "damage": { "op": "add", "value": 5 } } },
      { "descriptionKey": "upgrade.bullet.3", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.bullet.4", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.bullet.5", "effects": { "penetration": { "op": "add", "value": 1 } } },
      { "descriptionKey": "upgrade.bullet.6", "effects": { "cooldown": { "op": "multiply", "value": 0.85 } } },
      { "descriptionKey": "upgrade.bullet.7", "effects": { "damage": { "op": "add", "value": 15 } } }
    ],
    BOOMERANG: [
      { "descriptionKey": "upgrade.boomerang.1", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.boomerang.2", "effects": { "cooldown": { "op": "multiply", "value": 0.85 } } },
      { "descriptionKey": "upgrade.boomerang.3", "effects": { "range": { "op": "multiply", "value": 1.2 } } },
      { "descriptionKey": "upgrade.boomerang.4", "effects": { "damage": { "op": "add", "value": 15 } } },
      { "descriptionKey": "upgrade.boomerang.5", "effects": { "cooldown": { "op": "multiply", "value": 0.80 } } }
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
      { "descriptionKey": "upgrade.sunfire.9", "effects": { "cooldown": { "op": "set", "value": 0 } } }
    ],
    ICE_SHARD: [
      { "descriptionKey": "upgrade.iceshard.1", "effects": { "firePattern": { "op": "set", "value": "forward_backward" } } },
      { "descriptionKey": "upgrade.iceshard.2", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.iceshard.3", "effects": { "firePattern": { "op": "set", "value": "cardinal" } } },
      { "descriptionKey": "upgrade.iceshard.4", "effects": { "range": { "op": "add", "value": 100 } } },
      { "descriptionKey": "upgrade.iceshard.5", "effects": { "damage": { "op": "add", "value": 15 } } },
      { "descriptionKey": "upgrade.iceshard.6", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.iceshard.7", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.iceshard.8", "effects": { "firePattern": { "op": "set", "value": "all_8" } } }
    ],
    MAGIC_MISSILE: [
      { "descriptionKey": "upgrade.magicmissile.1", "effects": { "damage": { "op": "add", "value": 8 } } },
      { "descriptionKey": "upgrade.magicmissile.2", "effects": { "cooldown": { "op": "multiply", "value": 0.9 } } },
      { "descriptionKey": "upgrade.magicmissile.3", "effects": { "speed": { "op": "add", "value": 50 } } },
      { "descriptionKey": "upgrade.magicmissile.4", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.magicmissile.5", "effects": { "cooldown": { "op": "multiply", "value": 0.85 } } }
    ]
};