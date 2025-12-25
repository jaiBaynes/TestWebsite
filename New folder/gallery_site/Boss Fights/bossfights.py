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

#Pygame initilization
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

#Special Attacks (a class so multiple can happen)
class attack:
    def __init__(self, name, attackType, attackModifier):
        self.name = name
        self.attackType = attackType
        self.attackModifier = attackModifier

#Zeus/ Athena Attacks
class lightningBolt(attack):
    # heavenly light above top then bolt quickly comes down
    #alternate version is a chain of bolts
    def __init__(self, name, attackType, attackModifier):
        super().__init__(self, name, attackType, attackModifier)

class keraunos(attack):
    # launches the blade directly at your current location at an angle. Like roaring knight
    # can launch multiple of them in a row
    def __init__(self, name, attackType, attackModifier):
        super().__init__(self, name, attackType, attackModifier)

class eagleGust(attack):
    # Caucasian Eagle appears and flaps wings, blowing player in that direction, making it harder to move
    # no damage
    def __init__(self, name, attackType, attackModifier):
        super().__init__(self, name, attackType, attackModifier)

# Hades/ Cerberus attacks
class fireBlast(attack):
    # Fires start underneath you and then shoot up
    def __init__(self, name, attackType, attackModifier):
        super().__init__(self, name, attackType, attackModifier)

class fireWall (attack):
    # covers portion of the screen with fire
    # fired from monster head to the side. either left or right
    def __init__(self, name, attackType, attackModifier):
        super().__init__(self, name, attackType, attackModifier)


#Boss initialization
Zeus = boss("Zeus", "Storm God-King of Olympus", 10,10,10,10,10,Yellow,"Zeus Boss Image.png", "philipe_sca", [lightningBolt, keraunos])
boss = Zeus

# Main
while True:
    screen.blit(boss.image, (0,0))
    # Update the display to show what's drawn
        
    pygame.display.update()     
    clock.tick(FPS)     