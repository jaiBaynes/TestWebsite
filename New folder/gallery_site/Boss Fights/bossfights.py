#Boss Fight

#Bosses are classes so you can have 2v1 where you fight both at once
#Player is a class so it can be multiplayer

#Standard Imports
import pygame
import math 
from math import sqrt
import random
from pygame.locals import* # imports from pygame.locals
import os
xval = 1000
yval = 1000
win = pygame.display.set_mode ((xval - 20,int(yval)),HWSURFACE|DOUBLEBUF|RESIZABLE)
clock = pygame.time.Clock()
FPS = 10

#Pygame initialization
pygame.init()

# Set up the display
screen = pygame.display.set_mode((xval, yval))

#Colors
Yellow = (255,255,0)
Black = (0,0,0)
Red = (255,0,0)
Blue = (0,0,255)
Purple = (200,0,255)
Green = (0,255,0)
White = (255, 255,255)
Gray = (127, 127, 127)
Grey = Gray
Cyan = (0, 255, 255)
Magenta = (255, 0, 255)

#Bosses
class boss:
    # Name, type, strength, speed, durability, regeneration, supernatural, size, intelligence, stamina, hax
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
        self.cooldown = 100

    def attack(self):
        if self.current_attack is None:
            self.current_attack = random.choice(self.attacks)()
            self.cooldown = 0
            self.cooldown -= self.current_attack.attackModifier
        else:
            self.current_attack = None

#Special Attacks (a class so multiple can happen)
class attack:
    def __init__(self, name, attackType, attackModifier):
        self.name = name
        self.attackType = attackType
        self.attackModifier = attackModifier

    def useAttack(self):
        print(self.name)
        self.cooldown = 0

#Zeus/ Athena Attacks
class lightningBolt(attack):
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
        self.useAttack()

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

#Boss initialization
Zeus = boss("Zeus", "Storm God-King of Olympus", 10,10,10,10,10,Yellow,"Zeus Boss Image.png", "philipe_sca", [lightningBolt, keraunos, eagleGust])
boss = Zeus

# Main
while True:
    screen.blit(boss.image, (0,0))
    # Update the display to show what's drawn
    
    # Boss attack
    boss.cooldown += boss.speed
    if boss.cooldown >= 100:
        boss.attack()
        
    pygame.display.update()     
    clock.tick(FPS)
