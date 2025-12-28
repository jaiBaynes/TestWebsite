"""Tweakable configuration values for Boss Fights (damage, durations, balancing)."""
# Elemental status defaults
ELEMENT_CONFIG = {
    'electric': {
        'stun_seconds': 0.7,
        'base_damage': 45,
    },
    'wind': {
        'push_strength': 20,
        'base_damage': 12,
    },
    'fire': {
        'burn_seconds': 3,
        'burn_dps': 2.0,
        'base_damage': 18,
    },
    'poison': {
        'poison_seconds': 6,
        'poison_dps': 1.0,
        'base_damage': 10,
    },
}

# Minion limits per type (per boss)
MINION_LIMITS = {
    'Aquila': 1,
    'CerberusHead': 3,
}

# Default boss selected by website / external launcher (Zeus or Hades)
DEFAULT_BOSS = "Hades" #'Zeus'

# Global attack tuning
ATTACK_TUNING = {
    'boss_attack_chance_divisor': 400.0,  # used to scale boss.speed to spawn chance
}
