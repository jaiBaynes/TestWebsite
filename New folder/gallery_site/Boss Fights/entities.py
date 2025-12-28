"""Entities: Player, Boss, Minion."""
from __future__ import annotations

import random
from typing import List, Optional, Tuple
import pygame
from utils import load_image
from attacks import Attack


class Player:
    """Player constrained to a horizontal line.

    Has HP and an attack gauge which, when full, allows a player turn.
    """

    def __init__(self, screen_size: Tuple[int, int]):
        w, h = screen_size
        self.x = w / 2
        self.y = h * 0.8
        self.radius = max(6, int(w * 0.01))
        self.speed = max(4, int(w * 0.01 * 1.5))
        self.hp = 100
        self.attack_gauge = 0.0

    def move(self, dx: float, screen_width: int) -> None:
        self.x += dx
        self.x = max(self.radius, min(screen_width - self.radius, self.x))

    def draw(self, surf: pygame.Surface) -> None:
        pygame.draw.line(surf, (255, 255, 255), (0, self.y), (surf.get_width(), self.y), 1)
        pygame.draw.circle(surf, (0, 0, 0), (int(self.x), int(self.y)), self.radius)


class Boss:
    """Boss with attributes and a list of attack classes (not instances).

    Boss.schedule_attack will instantiate attacks and add to boss.active_attacks.
    """

    def __init__(self, name: str, characterTitle: str, strength: int, speed: int, durability: int, regeneration: int, supernatural: int, color: Tuple[int, int, int], image_file: str, artist: str, attacks: list):
        self.name = name
        self.characterTitle = characterTitle
        self.strength = strength
        self.speed = speed
        self.durability = durability
        self.regeneration = regeneration
        self.supernatural = supernatural
        self.color = color
        self.artist = artist
        self.attacks = attacks
        self.active_attacks: List[Attack] = []
        self.minions: List[Minion] = []
        self.hp = 100
        self.image_file = image_file
        self.image: Optional[pygame.Surface] = None

    def ensure_image(self, size: Tuple[int, int]) -> None:
        if self.image is None:
            try:
                self.image = pygame.transform.scale(load_image(self.image_file), size)
            except Exception:
                self.image = pygame.Surface(size)
                self.image.fill(self.color)

    def schedule_attack(self, attack_cls, game: "Game"):
        # limit max number of same attack
        candidate = attack_cls()
        same_name_count = sum(1 for a in self.active_attacks if a.name == candidate.name)
        if same_name_count >= getattr(candidate, "max_number", 1):
            return None
        candidate.spawn(game)
        self.active_attacks.append(candidate)
        return candidate

    def update(self, game: "Game") -> None:
        # probabilistically schedule attacks using speed
        if random.random() < (self.speed / 400.0):
            attack_cls = random.choice(self.attacks)
            self.schedule_attack(attack_cls, game)

        # update attacks
        for atk in list(self.active_attacks):
            atk.update(game)
            if atk.is_finished():
                self.active_attacks.remove(atk)

        # regeneration
        self.hp = min(100, self.hp + self.regeneration * 0.01)

    def draw(self, game: "Game") -> None:
        w, h = game.screen.get_size()
        boss_h = int(h * 0.45)
        self.ensure_image((w, boss_h))
        game.screen.blit(self.image, (0, 0))

    def take_damage(self, amount: int) -> None:
        self.hp -= amount
        if self.hp < 0:
            self.hp = 0


class Minion(Boss):
    def __init__(self, name: str, artist: str, hp: int = 10):
        # simple minion with one gust attack
        super().__init__(name, name, 1, 10, 1, 0, 0, (200, 200, 200), "Aquila.png", artist, attacks=[])
        self.hp = hp
