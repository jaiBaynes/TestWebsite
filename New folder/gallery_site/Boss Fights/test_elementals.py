from attacks import LightningStrikeAttack, SideWallAttack, RisingTornado
from entities import Player
from game import Game

print('--- elemental effects unit test ---')

g = Game((640,480))
player = Player(g.screen.get_size())

# Electric
atk = LightningStrikeAttack()
atk.spawn(g)
atk.state = 'active'
print('Before Electric: hp=', player.hp, 'statuses=', player.statuses)
atk.apply_to_player(player, g)
print('After Electric: hp=', player.hp, 'statuses=', player.statuses)

# Wind (push)
player = Player(g.screen.get_size())
player.x = g.screen.get_width() * 0.75
atk = SideWallAttack(side='left')
atk.spawn(g)
atk.state = 'active'
print('\nBefore Wind: x=', player.x)
atk.apply_to_player(player, g)
print('After Wind: x=', player.x, 'hp=', player.hp, 'statuses=', player.statuses)

# Fire (burn) - using a RisingTornado but set element to fire to test effect
player = Player(g.screen.get_size())
fire_atk = RisingTornado()
fire_atk.element_type = 'fire'
fire_atk.spawn(g)
fire_atk.state = 'active'
print('\nBefore Fire: statuses=', player.statuses)
fire_atk.apply_to_player(player, g)
print('After Fire: statuses=', player.statuses)

# Fire burn damage over a few frames
for i in range(60):
    player.update_statuses()
print('After 1s of burn, hp=', player.hp, 'statuses=', player.statuses)

# Poison
player = Player(g.screen.get_size())
poison = RisingTornado()
poison.element_type = 'poison'
poison.apply_to_player(player, g)
print('\nAfter Poison: statuses=', player.statuses)

# Simulate 180 frames (~3s) to let DoT run
for i in range(180):
    player.update_statuses()

print('\nPost-updates hp=', player.hp, 'statuses=', player.statuses)

# Stun prevents movement
player = Player(g.screen.get_size())
player.add_status('stun', int(0.7 * 60))
orig_x = player.x
player.move(50, g.screen.get_width())
print('\nStun test: original x=', orig_x, 'after attempted move x=', player.x)

print('--- done ---')
