# Boss Fight

# Bosses are classes so you can have 2v1 where you fight both at once
# Player is a class so it can be multiplayer

# Standard Imports
import pygame
import math 
from math import sqrt
import random
from pygame.locals import* # imports from pygame.locals
import os

xval = 1000
yval = 1000
win = pygame.display.set_mode((xval - 20, int(yval)), HWSURFACE | DOUBLEBUF | RESIZABLE)
clock = pygame.time.Clock()
FPS = 60

# Pygame initialization
pygame.init()

# Set up the display
screen = pygame.display.set_mode((xval, yval))

# Colors
Yellow = (255, 255, 0)
Black = (0, 0, 0)
Red = (255, 0, 0)
Blue = (0, 0, 255)
Purple = (200, 0, 255)
Green = (0, 255, 0)
White = (255, 255, 255)
Gray = (127, 127, 127)
Grey = Gray
Cyan = (0, 255, 255)
Magenta = (255, 0, 255)

# Player class
class Player:
    def __init__(self):
        self.x = xval // 2
        self.y = 4*yval//5
        self.radius = 10
        self.speed = 15

    def move(self, dx):
        self.x += dx
        if self.x < self.radius:
            self.x = self.radius
        elif self.x > xval - self.radius:
            self.x = xval - self.radius

    def draw(self, surface):
        pygame.draw.line(surface, White, (0, self.y), (xval, self.y), 1)
        pygame.draw.circle(surface, Black, (self.x, self.y), self.radius)

# Bosses
class boss:
    def __init__(self, name, characterTitle, strength, speed, durability, regeneration, supernatural, color, image, artist, attacks):
        self.name = name
        self.strength = strength
        self.speed = speed
        self.durability = durability
        self.regeneration = regeneration
        self.supernatural = supernatural
        self.color = color
        self.characterTitle = characterTitle
        self.image = pygame.transform.scale(pygame.image.load(image), (xval, yval))
        self.artist = artist
        self.attacks = attacks
        self.current_attack = None
        self.active_attacks = []
        self.cooldown = 100

    def attack(self):
        if self.current_attack is None and len(self.active_attacks) == 0:
            self.current_attack = random.choice(self.attacks)()
            self.active_attacks.append(self.current_attack)
            self.cooldown = 0
            self.cooldown -= self.current_attack.attackModifier
        else:
            self.current_attack = None

    def update_attacks(self):
        for attack in self.active_attacks:
            if attack.is_complete():
                self.active_attacks.remove(attack)

# Special Attacks (a class so multiple can happen)
class attack:
    def __init__(self, name, attackType, attackModifier):
        self.name = name
        self.attackType = attackType
        self.attackModifier = attackModifier
        self.duration = 0

    def useAttack(self):
        self.cooldown = 0

    def is_complete(self):
        return self.duration <= 0

# Zeus/ Athena Attacks
class lightningBolt(attack):
    # When lightning bolt is use, it makes the image "Lightning Strike.png" appear spanning from the top to the bottom of the screen and if a player is within its hitbox, they die. For fix seconds before the bolt appears, the image "Heavenly Light.png" shines on the spot where the attack will strike
    def __init__(self):
        super().__init__(name="Lightning Bolt", attackType="Magic", attackModifier=5)
        self.useAttack()

class keraunos(attack):
    def __init__(self):
        super().__init__(name="Keraunos", attackType="Physical", attackModifier=7)
        self.useAttack()

class eagleGust(attack):
    def __init__(self):
        super().__init__(name="Eagle Gust", attackType="Wind", attackModifier=0)
        self.direction = random.choice(("left", "right"))
        self.useAttack()
        self.duration = random.randint(50, 300)

    def blowDirection(self, direction):
        global player
        blowSpeed = 5
        if direction == "left":
            blowSpeed *= -1
        player.move(blowSpeed)
        self.duration -= 1
        #print(self.duration)

# Hades/ Cerberus attacks
class fireBlast(attack):
    def __init__(self):
        super().__init__(name="Fire Blast", attackType="Fire", attackModifier=6)
        self.useAttack()

class fireWall(attack):
    def __init__(self):
        super().__init__(name="Fire Wall", attackType="Fire", attackModifier=8)
        self.useAttack()

class bident(attack):
    def __init__(self):
        super().__init__(name="Bident", attackType="Physical", attackModifier=9)
        self.useAttack()

# Boss initialization
Zeus = boss("Zeus", "Storm God-King of Olympus", 10, 10, 10, 10, 10, Yellow, "Zeus Boss Image.png", "philipe_sca", [lightningBolt, keraunos, eagleGust])
boss = Zeus

# Player initialization
player = Player()

# Main
while True:
    screen.blit(boss.image, (0, 0))
    player.draw(screen)
    
    # Boss attack
    boss.cooldown += boss.speed
    if boss.cooldown >= 100:
        boss.attack()

    for attack in boss.active_attacks:
        #print(attack.name)
        if attack.name == "Eagle Gust":
            attack.blowDirection(attack.direction)  # Example direction, can be randomized

    boss.update_attacks()

    pygame.display.update()     
    clock.tick(FPS)
    
    # Player movement
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False  
        # Key checks MUST be inside the for loop
        keys = pygame.key.get_pressed()
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            player.move(-1*player.speed)
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            player.move(player.speed)
