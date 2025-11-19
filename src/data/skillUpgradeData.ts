import { UpgradeLevel } from "../utils/types";

export const SKILL_UPGRADE_DATA: { [key: string]: UpgradeLevel[] } = {
    ENERGY_PULSE: [
      { "descriptionKey": "upgrade.energypulse.1", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.energypulse.2", "effects": { "cooldown": { "op": "add", "value": -1000 } } },
      { "descriptionKey": "upgrade.energypulse.3", "effects": { "range": { "op": "multiply", "value": 1.2 } } },
      { "descriptionKey": "upgrade.energypulse.4", "effects": { "damage": { "op": "add", "value": 15 } } },
      { "descriptionKey": "upgrade.energypulse.5", "effects": { "cooldown": { "op": "add", "value": -1000 } } }
    ],
    TOUGHNESS: [
       { "descriptionKey": "upgrade.toughness.1", "effects": { "maxHp": { "op": "multiply", "value": 1.1 } } },
       { "descriptionKey": "upgrade.toughness.2", "effects": { "maxHp": { "op": "multiply", "value": 1.1 } } },
       { "descriptionKey": "upgrade.toughness.3", "effects": { "maxHp": { "op": "multiply", "value": 1.15 } } },
       { "descriptionKey": "upgrade.toughness.4", "effects": { "maxHp": { "op": "multiply", "value": 1.15 } } }
    ],
    REGENERATION: [
       { "descriptionKey": "upgrade.regeneration.1", "effects": { "hpRegen": { "op": "add", "value": 0.5 } } },
       { "descriptionKey": "upgrade.regeneration.2", "effects": { "hpRegen": { "op": "add", "value": 0.5 } } },
       { "descriptionKey": "upgrade.regeneration.3", "effects": { "hpRegen": { "op": "add", "value": 1.0 } } },
       { "descriptionKey": "upgrade.regeneration.4", "effects": { "hpRegen": { "op": "add", "value": 1.0 } } }
    ],
    SWIFTNESS: [
       { "descriptionKey": "upgrade.swiftness.1", "effects": { "speed": { "op": "multiply", "value": 1.05 } } },
       { "descriptionKey": "upgrade.swiftness.2", "effects": { "speed": { "op": "multiply", "value": 1.05 } } },
       { "descriptionKey": "upgrade.swiftness.3", "effects": { "speed": { "op": "multiply", "value": 1.10 } } },
       { "descriptionKey": "upgrade.swiftness.4", "effects": { "speed": { "op": "multiply", "value": 1.10 } } }
    ],
    HOLY_NOVA: [
      { "descriptionKey": "upgrade.holynova.1", "effects": { "damage": { "op": "add", "value": 10 } } },
      { "descriptionKey": "upgrade.holynova.2", "effects": { "range": { "op": "add", "value": 50 } } },
      { "descriptionKey": "upgrade.holynova.3", "effects": { "cooldown": { "op": "add", "value": -1000 } } },
      { "descriptionKey": "upgrade.holynova.4", "effects": { "damage": { "op": "add", "value": 15 } } },
      { "descriptionKey": "upgrade.holynova.5", "effects": { "range": { "op": "add", "value": 50 } } }
    ]
};