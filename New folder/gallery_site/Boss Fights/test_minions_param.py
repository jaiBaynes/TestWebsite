import pytest

from attacks import MinionSpawn
from game import Game
from config import MINION_LIMITS


@pytest.mark.parametrize("minion_name,boss_name", [
    ("Aquila", "Zeus"),
    ("CerberusHead", "Hades"),
])
def test_shared_minion_limits(minion_name: str, boss_name: str) -> None:
    """Ensure shared/global minion limits from config are respected across spawn attempts.

    This test tries to spawn more than the configured limit and asserts that only
    up to MINION_LIMITS[minion_name] instances exist afterwards.
    """
    g = Game((640, 480))
    # ensure a boss is present so spawns that reference game.boss behave consistently
    g.boss = g.create_boss(boss_name)

    allowed = MINION_LIMITS[minion_name]
    # attempt more spawns than allowed
    for _ in range(allowed + 2):
        s = MinionSpawn(minion_name=minion_name)
        s.spawn(g)
        # force the charge -> active transition
        s.timer = 0
        s.state = "charging"
        s.update(g)

    count = sum(1 for m in g.minions if m.name == minion_name)
    assert count == allowed, f"{minion_name} spawned {count} times; expected {allowed}"
