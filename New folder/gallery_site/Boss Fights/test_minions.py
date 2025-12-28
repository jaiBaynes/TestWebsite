from attacks import MinionSpawn
from game import Game

print('--- minion spawn limit test ---')
g = Game((640,480))
spawn = MinionSpawn(minion_name='Aquila')
spawn.spawn(g)
# fast-forward charge
spawn.timer = 0
spawn.state = 'charging'
# one update should move to active then spawn minion
spawn.update(g)
print('Minions after first spawn:', [m.name for m in g.minions])
# attempt spawn again
spawn2 = MinionSpawn(minion_name='Aquila')
spawn2.spawn(g)
spawn2.timer = 0
spawn2.state = 'charging'
spawn2.update(g)
print('Minions after second spawn attempt:', [m.name for m in g.minions])
# ensure only one
assert sum(1 for m in g.minions if m.name == 'Aquila') <= 1
print('PASS: Aquila limit enforced')
print('--- done ---')
