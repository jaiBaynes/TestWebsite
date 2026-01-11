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
    Supports status effects (stun, burn, poison, etc.).
    """

    def __init__(self, screen_size: Tuple[int, int]):
        w, h = screen_size
        self.x = w / 2
        self.y = h * 0.8
        self.radius = max(6, int(w * 0.01))
        self.speed = max(4, int(w * 0.01 * 1.5))
        self.max_hp = 100
        self.hp = float(self.max_hp)  # float to allow fractional DoT
        self.attack_gauge = 0.0
        # statuses: dict[name] = {'remaining': frames, 'dps': float, 'acc': float, 'meta': {...}}
        self.statuses = {}
        self.player_turn = False

    def move(self, dx: float, screen_width: int) -> None:
        # movement is disabled while stunned or it is the player's turn
        if self.is_stunned() or self.player_turn:
            return
        self.x += dx
        self.x = max(self.radius, min(screen_width - self.radius, self.x))
    
    def move_vertical(self, dy: float, screen_height: int) -> None:
        # movement is disabled while stunned or it is the player's turn
        if self.is_stunned() or self.player_turn:
            return
        self.y += dy
        self.y = max(self.radius, min(screen_height - self.radius, self.y))
        
    def draw(self, surf: pygame.Surface) -> None:
        pygame.draw.line(surf, (255, 255, 255), (0, self.y), (surf.get_width(), self.y), 1)
        pygame.draw.circle(surf, (0, 0, 0), (int(self.x), int(self.y)), self.radius)

    # Status management
    def add_status(self, name: str, duration_frames: int, dps: float = 0.0, meta: dict | None = None) -> None:
        """Add or refresh a status on the player."""
        self.statuses[name] = {
            'remaining': int(duration_frames),
            'dps': float(dps),
            'acc': 0.0,
            'meta': meta or {}
        }

    def is_stunned(self) -> bool:
        return 'stun' in self.statuses and self.statuses['stun']['remaining'] > 0

    def update_statuses(self) -> None:
        """Update statuses each frame and apply DoT effects."""
        from utils import FPS
        to_remove = []
        for name, s in list(self.statuses.items()):
            if s['dps'] > 0.0:
                # apply fractional damage per frame
                dmg_frame = s['dps'] / float(FPS)
                self.hp -= dmg_frame
            s['remaining'] -= 1
            if s['remaining'] <= 0:
                to_remove.append(name)
        for n in to_remove:
            del self.statuses[n]


class Boss:
    """Boss with attributes and a list of attack classes (not instances).

    Boss.schedule_attack will instantiate attacks and add to boss.active_attacks.
    """

    def __init__(self, name: str, characterTitle: str, strength: int, speed: int, durability: int, regeneration: int, supernatural: int, color: Tuple[int, int, int], image_file: str, artist: str, boss_image: str, transform: str, max_hp: int, attacks: list):
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
        self.max_hp = int(max_hp)
        self.hp = float(self.max_hp)
        self.image_file = image_file
        self.image: Optional[pygame.Surface] = None
        self.transform = transform
        self.boss_image_file = boss_image
        self.boss_image: Optional[pygame.Surface] = None
        
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
        # Draw the boss image scaled to fill the entire background
        w, h = game.screen.get_size()
        self.ensure_image((w, h))
        game.screen.blit(self.image, (0, 0))
        
        if self.boss_image_file != None:
            self.boss_image = pygame.transform.scale(load_image(self.boss_image_file), (2*w//3,2*h//3))
            game.screen.blit(self.boss_image, (w//6, h//6))
            

    def take_damage(self, amount: int) -> None:
        self.hp -= amount
        if self.hp < 0:
            self.hp = 0


class Minion(Boss):
    def __init__(self, name: str, artist: str, hp: int = 10, image_file: str | None = None):
        # determine a sensible default image for this minion when not provided
        import os
        from utils import BASE_DIR

        def _guess_image(n: str) -> str:
            # try exact match
            candidates = [f"{n}.png", f"{n.replace('Head',' Head')}.png", f"{n.replace('Head',' head')}.png"]
            for c in candidates:
                if os.path.exists(os.path.join(BASE_DIR, c)):
                    return c
            # fallback: find any file containing name
            for f in os.listdir(BASE_DIR):
                if n.lower() in f.lower() and f.lower().endswith('.png'):
                    return f
            return "Aquila.png"

        img = image_file if image_file else _guess_image(name)
        super().__init__(name, name, 1, 10, 1, 0, 0, (200, 200, 200), img, artist, None,None, attacks=[])
        self.hp = hp
