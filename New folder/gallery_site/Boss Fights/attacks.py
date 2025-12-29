"""Attack classes and behaviors.

Each Attack supports a lifecycle (charging -> active -> finished) and
parameters such as charge_time, active_time, damage, tracking/homing behavior,
max_number etc. Subclasses implement movement and drawing specifics.
"""
from __future__ import annotations

import random
from typing import Optional, Tuple
import pygame
from utils import load_image, rect_circle_collide


class Attack:
    """Base attack class.

    Attributes:
        name: name identifier
        element_type: element (fire, electric, physical...)
        damage: how much HP it removes on collision
        charge_time, active_time: lifecycle timers (in frames)
        max_number: how many of these can exist simultaneously from a single boss
        tracking: whether it tracks player's position while charging
        homing: whether it homes after being active
    """

    def __init__(self, name: str, element_type: str = "physical", damage: int = 10):
        self.name = name
        self.element_type = element_type
        self.damage = damage
        self.charge_time = 30
        self.active_time = 60
        self.timer = 0
        self.state = "charging"
        self.rect = pygame.Rect(0, 0, 0, 0)
        self.charge_image: Optional[pygame.Surface] = None
        self.attack_image: Optional[pygame.Surface] = None
        self.max_number = 1
        self.tracking = False
        self.homing = False
        # optional speed/position variables for moving attacks
        self.pos = pygame.Vector2(0, 0)
        self.speed = 0.0

    def spawn(self, game: "Game") -> None:
        """Initialize attack on spawn."""
        self.timer = self.charge_time
        self.state = "charging"

    def update(self, game: "Game") -> None:
        if self.state == "charging":
            self.timer -= 1
            if self.timer <= 0:
                self.state = "active"
                self.timer = self.active_time
        elif self.state == "active":
            self.timer -= 1
            if self.timer <= 0:
                self.state = "finished"

    def draw(self, surf: pygame.Surface) -> None:
        if self.state == "charging" and self.charge_image:
            surf.blit(self.charge_image, self.rect.topleft)
        elif self.state == "active" and self.attack_image:
            surf.blit(self.attack_image, self.rect.topleft)
        elif self.state == "active":
            pygame.draw.rect(surf, (200, 50, 20), self.rect)
        else:
            # charging fallback
            pygame.draw.rect(surf, (200, 200, 0), self.rect, 2)

    def check_collision_with_player(self, player: "Player") -> bool:
        return rect_circle_collide(self.rect, (int(player.x), int(player.y)), player.radius)

    def is_finished(self) -> bool:
        return self.state == "finished"

    def apply_to_player(self, player: "Player", game: "Game") -> None:
        """Apply damage and elemental effects to the player when hit."""
        # base damage
        player.hp -= float(self.damage)
        # elemental side-effects
        from utils import FPS
        from config import ELEMENT_CONFIG
        if self.element_type == 'electric':
            # stun the player for configured duration
            stun_seconds = ELEMENT_CONFIG['electric'].get('stun_seconds', 0.7)
            stun_frames = int(stun_seconds * FPS)
            player.add_status('stun', stun_frames)
        elif self.element_type == 'wind':
            # immediate push away from center of attack rect
            if hasattr(self, 'rect') and self.rect.width > 0:
                push_strength = ELEMENT_CONFIG['wind'].get('push_strength', 20)
                push = -push_strength if player.x < (self.rect.left + self.rect.right) / 2 else push_strength
                player.move(push, game.screen.get_width())
        elif self.element_type == 'fire':
            # burn over configured seconds at configured DPS
            burn_seconds = ELEMENT_CONFIG['fire'].get('burn_seconds', 3)
            burn_dps = ELEMENT_CONFIG['fire'].get('burn_dps', 2.0)
            player.add_status('burn', int(burn_seconds * FPS), dps=burn_dps)
        elif self.element_type == 'poison':
            # poison for configured seconds at configured DPS
            poison_seconds = ELEMENT_CONFIG['poison'].get('poison_seconds', 6)
            poison_dps = ELEMENT_CONFIG['poison'].get('poison_dps', 1.0)
            player.add_status('poison', int(poison_seconds * FPS), dps=poison_dps)
        # default: other elements may be added later


# --- Zeus-specific attacks ---
class SideWallAttack(Attack):
    """Covers either full left or right side of the screen. Useful for 'tornado' wall."""

    def __init__(self, side: str = "left", width_frac: float = 0.25, damage: int | None = None):
        from config import ELEMENT_CONFIG
        dmg = damage if damage is not None else ELEMENT_CONFIG['wind']['base_damage']
        super().__init__(name="SideWall", element_type="wind", damage=dmg)
        self.side = side
        self.width_frac = width_frac
        self.charge_time = 45
        self.active_time = 120
        self.max_number = 1

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        width = int(w * self.width_frac)
        if self.side == "left":
            self.rect = pygame.Rect(0, 0, width, h)
        else:
            self.rect = pygame.Rect(w - width, 0, width, h)
        try:
            self.attack_image = pygame.transform.scale(load_image("Zeus Tornado.png"), (self.rect.width, self.rect.height))
        except Exception:
            self.attack_image = None


class HomingCloud(Attack):
    """Storm cloud that tracks player while charging then homes while active.

    Attributes:
        speed: movement speed while homing
    """

    def __init__(self, damage: int = 18):
        super().__init__(name="HomingCloud", element_type="electric", damage=damage)
        self.charge_time = 40
        self.active_time = 140
        self.speed = 5.0
        self.size = (40, 40)
        self.tracking = True
        self.homing = True
        self.max_number = 2

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        self.pos = pygame.Vector2(random.randint(50, w - 50), int(h * 0.15))
        self.rect = pygame.Rect(int(self.pos.x - self.size[0] / 2), int(self.pos.y - self.size[1] / 2), self.size[0], self.size[1])
        try:
            self.attack_image = pygame.transform.scale(load_image("Zeus Storm Cloud.png"), self.size)
            self.charge_image = pygame.transform.scale(load_image("Heavenly Light.png"), (48, 48))
        except Exception:
            pass

    def update(self, game: "Game") -> None:
        if self.state == "charging" and self.tracking:
            # slowly track player's x while charging
            player_x = game.player.x
            self.pos.x += (player_x - self.pos.x) * 0.06
            self.rect.topleft = (int(self.pos.x - self.size[0] / 2), int(self.pos.y - self.size[1] / 2))
            super().update(game)
        elif self.state == "active":
            # home toward player
            dir_vec = pygame.Vector2(game.player.x - self.pos.x, game.player.y - self.pos.y)
            if dir_vec.length() != 0:
                dir_vec.scale_to_length(self.speed)
                self.pos += dir_vec
            self.rect.topleft = (int(self.pos.x - self.size[0] / 2), int(self.pos.y - self.size[1] / 2))
            super().update(game)


class RisingTornado(Attack):
    """Grows from bottom at player's x position."""

    def __init__(self, damage: int = 22):
        super().__init__(name="RisingTornado", element_type="wind", damage=damage)
        self.charge_time = 28
        self.active_time = 90
        self.growth = 0
        self.width_frac = 0.08
        self.tornado_img: Optional[pygame.Surface] = None

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        width = max(16, int(w * self.width_frac))
        self.x = int(game.player.x)
        self.growth = 0
        self.rect = pygame.Rect(max(0, self.x - width // 2), h, width, 0)
        try:
            self.tornado_img = load_image("Zeus Tornado.png")
        except Exception:
            self.tornado_img = None

    def update(self, game: "Game") -> None:
        if self.state == "charging":
            super().update(game)
        elif self.state == "active":
            w, h = game.screen.get_size()
            growth_rate = max(4, int(h * 0.02))
            self.growth += growth_rate
            new_height = min(h, self.growth)
            self.rect = pygame.Rect(max(0, self.x - self.rect.width // 2), h - new_height, self.rect.width, new_height)
            super().update(game)

    def draw(self, surf: pygame.Surface) -> None:
        if self.state == "charging":
            # simple charge indicator
            pygame.draw.rect(surf, (200, 180, 0), pygame.Rect(self.x - 6, surf.get_height() - 60, 12, 24))
        elif self.state == "active":
            if self.tornado_img:
                img = pygame.transform.scale(self.tornado_img, (self.rect.width, max(1, self.rect.height)))
                surf.blit(img, self.rect.topleft)
            else:
                pygame.draw.rect(surf, (180, 30, 200), self.rect)


# --- Hades fire attacks (prototypes for later boss) ---
class FireBlast(Attack):
    """An upward fire explosion from the bottom of the screen."""

    def __init__(self, damage: int | None = None):
        from config import ELEMENT_CONFIG
        dmg = damage if damage is not None else ELEMENT_CONFIG['fire']['base_damage']
        super().__init__(name="FireBlast", element_type="fire", damage=dmg)
        self.charge_time = 36
        self.active_time = 40
        self.growth = 0
        self.width_frac = 0.12

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        width = max(16, int(w * self.width_frac))
        self.x = int(game.player.x)
        self.growth = 0
        self.rect = pygame.Rect(max(0, self.x - width // 2), h, width, 0)

    def update(self, game: "Game") -> None:
        if self.state == "charging":
            super().update(game)
        elif self.state == "active":
            w, h = game.screen.get_size()
            growth_rate = max(8, int(h * 0.04))
            self.growth += growth_rate
            new_height = min(h // 2, self.growth)
            self.rect = pygame.Rect(max(0, self.x - self.rect.width // 2), h - new_height, self.rect.width, new_height)
            super().update(game)

    def draw(self, surf: pygame.Surface) -> None:
        if self.state == "charging":
            pygame.draw.rect(surf, (255, 120, 20), pygame.Rect(self.x - 6, surf.get_height() - 40, 12, 24))
        elif self.state == "active":
            try:
                img = load_image("Fireblast.png")
                img = pygame.transform.scale(img, (self.rect.width, max(1, self.rect.height)))
                surf.blit(img, self.rect.topleft)
            except Exception:
                pygame.draw.rect(surf, (255, 80, 0), self.rect)


class FireWall(Attack):
    """A wall of flame that covers one side or the entire bottom edge."""

    def __init__(self, side: str = "bottom", damage: int | None = None):
        from config import ELEMENT_CONFIG
        dmg = damage if damage is not None else ELEMENT_CONFIG['fire']['base_damage']
        super().__init__(name="FireWall", element_type="fire", damage=dmg)
        self.side = side
        self.charge_time = 40
        self.active_time = 140

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        if self.side == "bottom":
            height = int(h * 0.2)
            self.rect = pygame.Rect(0, h - height, w, height)
        elif self.side == "left":
            self.rect = pygame.Rect(0, 0, int(w * 0.25), h)
        else:
            self.rect = pygame.Rect(int(w * 0.75), 0, int(w * 0.25), h)

    def draw(self, surf: pygame.Surface) -> None:
        if self.state == "charging":
            pygame.draw.rect(surf, (200, 80, 0), self.rect, 2)
        elif self.state == "active":
            try:
                img = load_image("Fireblast.png")
                img = pygame.transform.scale(img, (self.rect.width, self.rect.height))
                surf.blit(img, self.rect.topleft)
            except Exception:
                pygame.draw.rect(surf, (255, 80, 0), self.rect)


class BidentAttack(Attack):
    """A downward stabbing attack that can track the player during charge and then strike."""

    def __init__(self, damage: int | None = None, tracking: bool = True):
        from config import ELEMENT_CONFIG
        dmg = damage if damage is not None else ELEMENT_CONFIG['fire'].get('base_damage', 12)
        super().__init__(name="Bident", element_type="physical", damage=dmg)
        self.charge_time = 38
        self.active_time = 15
        self.tracking = tracking
        self.x = None

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        if self.tracking and random.random() < 0.8:
            self.x = int(game.player.x)
        else:
            self.x = random.randint(64, w - 64)
        width = max(10, int(w * 0.03))
        self.rect = pygame.Rect(max(0, self.x - width // 2), 0, width, h)

    def draw(self, surf: pygame.Surface) -> None:
        if self.state == "charging":
            # ensure x is set (fallback to center)
            if self.x is None:
                self.x = surf.get_width() // 2
            try:
                # try a few fallback names in case of asset naming differences
                img = None
                for candidate in ("Hades Bident.png", "Bident.png", "HadesBident.png"):
                    try:
                        img = load_image(candidate)
                        break
                    except Exception:
                        img = None
                if img:
                    # charge marker is slightly larger and centered above the hitline
                    ch_w = max(48, int(surf.get_width() * 0.03))
                    ch_h = min(120, max(48, ch_w * 2))
                    # cache per-attack scaled charge image
                    if not hasattr(self, '_charge_cache') or self._charge_cache.get('size') != (ch_w, ch_h):
                        self._charge_cache = {'size': (ch_w, ch_h), 'img': pygame.transform.scale(img, (ch_w, ch_h))}
                    surf.blit(self._charge_cache['img'], (self.x - ch_w // 2, 30))
                else:
                    raise FileNotFoundError("Bident image not found")
            except Exception:
                pygame.draw.rect(surf, (160, 160, 160), pygame.Rect(self.x - 8, 0, 16, 40))
        elif self.state == "active":
            # when active, make the bident visual cover the full vertical rect like a lightning strike
            try:
                img = None
                for candidate in ("Hades Bident.png", "Bident.png", "HadesBident.png"):
                    try:
                        img = load_image(candidate)
                        break
                    except Exception:
                        img = None
                if img:
                    target_size = (max(8, self.rect.width), self.rect.height)
                    if not hasattr(self, '_active_cache') or self._active_cache.get('size') != target_size:
                        self._active_cache = {'size': target_size, 'img': pygame.transform.scale(img, target_size)}
                    surf.blit(self._active_cache['img'], self.rect.topleft)
                else:
                    raise FileNotFoundError("Bident image not found")
            except Exception:
                pygame.draw.rect(surf, (180, 160, 120), self.rect)


class MinionSpawn(Attack):
    """Spawns a named minion when charge completes; enforces a per-boss limit."""

    def __init__(self, minion_name: str = "Aquila", max_allowed: int = 1):
        super().__init__(name=f"MinionSpawn_{minion_name}", element_type="summon", damage=0)
        self.charge_time = 30
        self.active_time = 1
        self.minion_name = minion_name
        self.max_allowed = max_allowed

    def spawn(self, game: "Game") -> None:
        super().spawn(game)

    def update(self, game: "Game") -> None:
        prev_state = self.state
        super().update(game)
        # when charging -> active transition, spawn minion (if under limit)
        if prev_state == "charging" and self.state == "active":
            from entities import Minion
            from config import MINION_LIMITS

            # determine how many of this minion already exist
            current = sum(1 for m in game.minions if m.name == self.minion_name)
            allowed = MINION_LIMITS.get(self.minion_name, self.max_allowed)
            if current < allowed:
                minion = Minion(name=self.minion_name, artist="the.creature.keeper", hp=max(5, int(game.boss.hp * 0.1)))
                game.add_minion(minion)
            # finish in any case (prevents repeated immediate spawns)
            self.state = "finished"


class LightningStrikeAttack(Attack):
    """Vertical lightning strike that can track player on spawn (tracking flag)."""

    def __init__(self, damage: int | None = None, tracking: bool = True):
        # allow config default if damage is None
        from config import ELEMENT_CONFIG
        dmg = damage if damage is not None else ELEMENT_CONFIG['electric']['base_damage']
        super().__init__(name="LightningStrike", element_type="electric", damage=dmg)
        self.charge_time = 50
        self.active_time = 20
        self.tracking = tracking

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        if self.tracking and random.random() < 0.75:
            self.x = int(game.player.x)
        else:
            self.x = random.randint(50, w - 50)
        width = max(12, int(w * 0.03))
        self.rect = pygame.Rect(max(0, self.x - width // 2), 0, width, h)
        try:
            self.charge_image = pygame.transform.scale(load_image("Heavenly Light.png"), (48, 48))
            self.attack_image = pygame.transform.scale(load_image("Lightning Strike.png"), (self.rect.width, self.rect.height))
        except Exception:
            pass

    def draw(self, surf: pygame.Surface) -> None:
        if self.state == "charging":
            if self.charge_image:
                surf.blit(self.charge_image, (self.x - 24, 30))
            else:
                pygame.draw.rect(surf, (240, 240, 0), pygame.Rect(self.x - 4, 0, 8, 40))
        elif self.state == "active":
            if self.attack_image:
                surf.blit(self.attack_image, self.rect.topleft)
            else:
                pygame.draw.rect(surf, (240, 240, 0), self.rect)


# simple gust used by minions
class EagleGustAttack(Attack):
    def __init__(self, damage: int = 0):
        from config import ELEMENT_CONFIG
        dmg = damage if damage is not None else ELEMENT_CONFIG['wind']['base_damage']
        super().__init__(name="EagleGust", element_type="wind", damage=dmg)
        self.charge_time = 8
        self.active_time = 14
        self.direction = random.choice(("left", "right"))

    def spawn(self, game: "Game") -> None:
        super().spawn(game)
        w, h = game.screen.get_size()
        self.rect = pygame.Rect(0, int(h * 0.6), w, int(h * 0.2))

    def update(self, game: "Game") -> None:
        super().update(game)
        if self.state == "active":
            push = -6 if self.direction == "left" else 6
            # Wind gust also applies the wind element behavior via apply_to_player when colliding
            # For minion gust we just push the player if they overlap with the gust rect
            if self.check_collision_with_player(game.player):
                game.player.move(push, game.screen.get_width())



