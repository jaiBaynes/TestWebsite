"""Boss Fights - Refactored Prototype

This file refactors the earlier prototype into cleaner OOP-style code suitable
for extension (Zeus-first). Key classes: Game, Player, Boss, Minion, Attack.
Zeus-specific attacks (tornado, stormCloud, risingTornado, aquila minion)
are implemented as prototypes using available assets.

Design choices:
- Attacks have a lifecycle: 'charging' (telegraph) -> 'active' -> 'finished'
- Player is constrained to a horizontal line; collisions are rect vs circle checks
- Images are scaled to the current window size to make the game responsive
- Sound hooks are present but audio files are optional
"""

import os
import math
import random
import pygame
from typing import List, Optional, Tuple

# --- Configuration & Initialization ---
pygame.init()
DEFAULT_SIZE = (800, 800)
FPS = 60
BASE_DIR = os.path.dirname(__file__)

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
YELLOW = (255, 255, 0)
RED = (255, 0, 0)

# Helper functions

def load_image(name: str) -> pygame.Surface:
    """Load an image from the Boss Fights directory and return a Surface."""
    path = os.path.join(BASE_DIR, name)
    return pygame.image.load(path).convert_alpha()


def rect_circle_collide(rect: pygame.Rect, circle_pos: Tuple[int, int], circle_radius: int) -> bool:
    """Return True if rect collides with circle (center+radius)."""
    cx, cy = circle_pos
    nearest_x = max(rect.left, min(cx, rect.right))
    nearest_y = max(rect.top, min(cy, rect.bottom))
    dx = cx - nearest_x
    dy = cy - nearest_y
    return dx * dx + dy * dy <= circle_radius * circle_radius


# --- Core Classes ---
class Player:
    """Player constrained to a horizontal line that can move left/right.

    Attributes:
        x (float): x position in pixels
        y (float): y position in pixels (determined by screen height)
        radius (int): visual radius (scaled)
        hp (int): player health
        speed (float): movement speed (pixels per frame)
        attack_gauge (float): builds up during enemy turns; when >=100, player turn
    """

    def __init__(self, screen_size: Tuple[int, int]):
        w, h = screen_size
        self.x = w / 2
        self.y = h * 0.8
        self.radius = max(6, int(w * 0.01))
        self.speed = max(4, int(w * 0.01 * 1.5))
        self.hp = 100
        self.attack_gauge = 0.0

    def move(self, dx: float, screen_width: int):
        self.x += dx
        self.x = max(self.radius, min(screen_width - self.radius, self.x))

    def draw(self, surf: pygame.Surface):
        # ground line
        pygame.draw.line(surf, WHITE, (0, self.y), (surf.get_width(), self.y), 1)
        pygame.draw.circle(surf, BLACK, (int(self.x), int(self.y)), self.radius)


class Attack:
    """Base class for attacks. Subclass to implement specific behaviors.

    States: 'charging' (telegraph), 'active' (can damage), 'finished'.
    """

    def __init__(self, name: str, element_type: str = "physical", damage: int = 10):
        self.name = name
        self.element_type = element_type
        self.damage = damage
        self.state = "charging"
        self.charge_time = 60  # frames to telegraph by default
        self.active_time = 60  # frames active
        self.timer = 0
        # visuals (optional)
        self.charge_image: Optional[pygame.Surface] = None
        self.attack_image: Optional[pygame.Surface] = None
        self.rect = pygame.Rect(0, 0, 0, 0)

    def spawn(self, game: "Game"):
        """Called when the attack is added to the game; initialize positions here."""
        self.timer = self.charge_time
        self.state = "charging"

    def update(self, game: "Game") -> None:
        """Progress the attack lifecycle and update visuals/positions."""
        if self.state == "charging":
            self.timer -= 1
            if self.timer <= 0:
                self.state = "active"
                self.timer = self.active_time
        elif self.state == "active":
            self.timer -= 1
            if self.timer <= 0:
                self.state = "finished"

    def draw(self, surf: pygame.Surface):
        """Draw charge or active visuals. Subclasses should override."""
        if self.state == "charging" and self.charge_image:
            surf.blit(self.charge_image, self.rect.topleft)
        elif self.state == "active" and self.attack_image:
            surf.blit(self.attack_image, self.rect.topleft)
        else:
            # fallback: draw rect
            color = RED if self.state == "active" else YELLOW
            pygame.draw.rect(surf, color, self.rect, 0 if self.state == "active" else 2)

    def is_finished(self) -> bool:
        return self.state == "finished"

    def check_collision_with_player(self, player: Player) -> bool:
        return rect_circle_collide(self.rect, (int(player.x), int(player.y)), player.radius)


# --- Specific Attack Implementations for Zeus ---
class SideWallAttack(Attack):
    """Covers left or right side of screen for duration; damages if player enters.

    Uses an image optionally. """

    def __init__(self, side: str = "left", width_frac: float = 0.25, damage: int = 10):
        super().__init__(name="TornadoSideWall", element_type="wind", damage=damage)
        self.side = side
        self.width_frac = width_frac
        self.charge_time = 45
        self.active_time = 150

    def spawn(self, game: "Game"):
        super().spawn(game)
        w, h = game.screen.get_size()
        width = int(w * self.width_frac)
        if self.side == "left":
            self.rect = pygame.Rect(0, 0, width, h)
        else:
            self.rect = pygame.Rect(w - width, 0, width, h)
        # load image if provided
        try:
            self.attack_image = pygame.transform.scale(load_image("Zeus Tornado.png"), (self.rect.width, self.rect.height))
        except Exception:
            self.attack_image = None


class HomingCloud(Attack):
    """A storm cloud that charges, then homes toward the player's position and explodes."""

    def __init__(self, damage: int = 15):
        super().__init__(name="StormCloud", element_type="electric", damage=damage)
        self.charge_time = 40
        self.active_time = 120
        self.speed = 6.0
        self.pos = pygame.Vector2(0, 0)
        self.size = (40, 40)

    def spawn(self, game: "Game"):
        super().spawn(game)
        w, h = game.screen.get_size()
        # spawn at a random top area
        self.pos = pygame.Vector2(random.randint(50, w - 50), int(h * 0.15))
        self.rect = pygame.Rect(int(self.pos.x - self.size[0] / 2), int(self.pos.y - self.size[1] / 2), self.size[0], self.size[1])
        try:
            img = load_image("Zeus Storm Cloud.png")
            self.attack_image = pygame.transform.scale(img, self.size)
            self.charge_image = pygame.transform.scale(load_image("Heavenly Light.png"), (64, 64))
        except Exception:
            pass

    def update(self, game: "Game"):
        if self.state == "charging":
            # track player's x while charging (slowly)
            player_x = game.player.x
            self.pos.x += (player_x - self.pos.x) * 0.05
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
    """A tornado that rises from the bottom at the player's last x position and grows upward."""

    def __init__(self, damage: int = 20):
        super().__init__(name="RisingTornado", element_type="wind", damage=damage)
        self.charge_time = 30
        self.active_time = 90
        self.x = 0
        self.growth = 0  # pixels of height grown

    def spawn(self, game: "Game"):
        super().spawn(game)
        w, h = game.screen.get_size()
        # spawn at player's current x
        self.x = int(game.player.x)
        self.growth = 0
        width = int(w * 0.08)
        self.rect = pygame.Rect(max(0, self.x - width // 2), h, width, 0)
        # use tornado image and we'll blit it scaled by height
        try:
            self.tornado_img = load_image("Zeus Tornado.png")
        except Exception:
            self.tornado_img = None

    def update(self, game: "Game"):
        if self.state == "charging":
            super().update(game)
        elif self.state == "active":
            # grow upwards
            w, h = game.screen.get_size()
            growth_rate = int(h * 0.02)
            self.growth += growth_rate
            new_height = min(h, self.growth)
            self.rect = pygame.Rect(max(0, self.x - self.rect.width // 2), h - new_height, self.rect.width, new_height)
            super().update(game)

    def draw(self, surf: pygame.Surface):
        if self.state == "charging" and self.charge_image:
            surf.blit(self.charge_image, (self.rect.centerx - 32, surf.get_height() - 64))
        elif self.state == "active":
            if getattr(self, "tornado_img", None):
                # scale tornado image to rect height
                img = pygame.transform.scale(self.tornado_img, (self.rect.width, max(1, self.rect.height)))
                surf.blit(img, self.rect.topleft)
            else:
                pygame.draw.rect(surf, RED, self.rect)


class MinionSpawn(Attack):
    """Spawns an Aquila minion that inherits from Boss with small stats."""

    def __init__(self):
        super().__init__(name="AquilaSpawn", element_type="summon", damage=0)
        self.charge_time = 30
        self.active_time = 1

    def spawn(self, game: "Game"):
        super().spawn(game)
        # will spawn the minion when the charge completes

    def update(self, game: "Game"):
        prev_state = self.state
        super().update(game)
        if prev_state == "charging" and self.state == "active":
            # spawn minion
            minion = Minion(name="Aquila", artist="unknown", hp=int(game.boss.hp * 0.1), x=int(game.boss_img_center_x()))
            game.add_minion(minion)
            self.state = "finished"


# --- Boss Classes ---
class Boss:
    """Boss with attributes and a list of attack classes (not instances)."""

    def __init__(self, name: str, characterTitle: str, strength: int, speed: int, durability: int, regeneration: int, supernatural: int, color: Tuple[int, int, int], image_file: str, artist: str, attacks: List[type]):
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
        # load image lazily
        self.image_file = image_file
        self.image: Optional[pygame.Surface] = None

    def ensure_image(self, size: Tuple[int, int]):
        if self.image is None:
            try:
                self.image = pygame.transform.scale(load_image(self.image_file), size)
            except Exception:
                self.image = pygame.Surface(size)
                self.image.fill(self.color)

    def schedule_attack(self, attack_cls: type, game: "Game"):
        """Instantiate and schedule an attack to the game."""
        atk = attack_cls()
        atk.spawn(game)
        self.active_attacks.append(atk)
        return atk

    def update(self, game: "Game"):
        # schedule attacks probabilistically depending on speed
        if random.random() < (self.speed / 300.0):
            attack_cls = random.choice(self.attacks)
            self.schedule_attack(attack_cls, game)

        # update existing attacks
        for atk in list(self.active_attacks):
            atk.update(game)
            if atk.is_finished():
                self.active_attacks.remove(atk)

        # regeneration
        self.hp = min(100, self.hp + self.regeneration * 0.01)

    def draw(self, game: "Game"):
        # draw boss image covering top area
        w, h = game.screen.get_size()
        boss_h = int(h * 0.45)
        self.ensure_image((w, boss_h))
        game.screen.blit(self.image, (0, 0))

    def take_damage(self, amount: int):
        self.hp -= amount
        if self.hp < 0:
            self.hp = 0


class Minion(Boss):
    """Minions are simplified bosses with reduced stats."""

    def __init__(self, name: str, artist: str, hp: int = 10, x: int = 0):
        super().__init__(name, name, 1, 1, 1, 0, 0, (200, 200, 200), "Aquila.png", artist, attacks=[lambda: EagleGustAttack()])
        self.hp = hp
        self.x = x


class EagleGustAttack(Attack):
    """Minion's gust attack: briefly pushes the player left or right"""

    def __init__(self):
        super().__init__(name="EagleGust", element_type="wind", damage=0)
        self.charge_time = 8
        self.active_time = 12
        self.direction = random.choice(("left", "right"))

    def spawn(self, game: "Game"):
        super().spawn(game)
        # full-screen thin rect that will push player if inside
        w, h = game.screen.get_size()
        self.rect = pygame.Rect(0, int(h * 0.6), w, int(h * 0.2))

    def update(self, game: "Game"):
        super().update(game)
        if self.state == "active":
            # push player
            push = -6 if self.direction == "left" else 6
            game.player.move(push, game.screen.get_width())


# --- Game Manager ---
class Game:
    def __init__(self, size: Tuple[int, int] = DEFAULT_SIZE):
        self.screen = pygame.display.set_mode(size, pygame.RESIZABLE)
        pygame.display.set_caption("Boss Fights - Prototype")
        self.clock = pygame.time.Clock()
        self.running = True
        self.player = Player(self.screen.get_size())
        # create Zeus boss (Zeus-first)
        self.boss = Boss("Zeus", "Storm God-King of Olympus", 10, 40, 10, 5, 10, YELLOW, "Zeus Boss Image.png", "philipe_sca",
                         attacks=[lambda: LightningStrikeAttack(), lambda: SideWallAttack(side=random.choice(("left", "right"))), lambda: HomingCloud(), lambda: RisingTornado(), lambda: MinionSpawn()])
        self.minions: List[Minion] = []
        # load UI assets
        try:
            self.select_arrow = load_image("Select Arrow Icon.png")
        except Exception:
            self.select_arrow = None
        self.fps_font = pygame.font.SysFont(None, 20)

    def boss_img_center_x(self) -> int:
        # helper for attacks to position relative to boss image
        w, _ = self.screen.get_size()
        return w // 2

    def add_minion(self, minion: Minion):
        # position minion near top
        minion.ensure_image((80, 80))
        self.minions.append(minion)

    def add_attack_to_game(self, attack: Attack):
        # attach attack to a list that will be updated/drawn - for now attach to boss
        self.boss.active_attacks.append(attack)

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.VIDEORESIZE:
                # Responsive scaling: recreate screen to new size
                self.screen = pygame.display.set_mode((event.w, event.h), pygame.RESIZABLE)
                self.player = Player(self.screen.get_size())

        # Continuous key checks
        keys = pygame.key.get_pressed()
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            self.player.move(-self.player.speed, self.screen.get_width())
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            self.player.move(self.player.speed, self.screen.get_width())

    def update(self):
        # Boss AI / attacks
        self.boss.update(self)
        # update boss attacks
        for atk in list(self.boss.active_attacks):
            # check collisions
            if atk.state == "active" and atk.check_collision_with_player(self.player):
                self.player.hp -= atk.damage
                # small feedback: remove attack after hit
                atk.state = "finished"
        # update minions and their attacks
        for m in list(self.minions):
            # simple behavior: 1-in-100 chance to use their attack
            if random.random() < 0.01:
                m.schedule_attack(EagleGustAttack, self)

    def draw_ui(self):
        # Player HP and gauge
        hp_text = f"HP: {int(self.player.hp)}"
        gauge_text = f"Gauge: {int(self.player.attack_gauge)}%"
        hp_surf = self.fps_font.render(hp_text, True, WHITE)
        gauge_surf = self.fps_font.render(gauge_text, True, WHITE)
        self.screen.blit(hp_surf, (10, 10))
        self.screen.blit(gauge_surf, (10, 30))

    def draw(self):
        # clear
        self.screen.fill((30, 30, 40))
        # draw boss
        self.boss.draw(self)
        # draw boss attacks
        for atk in self.boss.active_attacks:
            if atk.state in ("charging", "active"):
                atk.draw(self.screen)
        # draw minions
        x = 20
        for m in self.minions:
            self.screen.blit(m.image, (x, 60))
            x += 90
        # draw player
        self.player.draw(self.screen)
        # draw UI
        self.draw_ui()
        # fps
        fps_surf = self.fps_font.render(str(int(self.clock.get_fps())), True, WHITE)
        self.screen.blit(fps_surf, (self.screen.get_width() - 30, 10))

    def run(self):
        """Main loop."""
        while self.running:
            dt = self.clock.tick(FPS)
            self.handle_events()
            self.update()
            self.draw()
            pygame.display.flip()
        pygame.quit()


# --- Concrete simple Lightning Attack using existing assets ---
class LightningStrikeAttack(Attack):
    def __init__(self):
        super().__init__(name="LightningBolt", element_type="electric", damage=50)
        self.charge_time = 50
        self.active_time = 20
        self.x = None

    def spawn(self, game: "Game"):
        super().spawn(game)
        # pick an x position: track player sometimes
        w, h = game.screen.get_size()
        if random.random() < 0.6:
            self.x = int(game.player.x)
        else:
            self.x = random.randint(50, w - 50)
        # the attack is a vertical strip across the screen
        width = max(12, int(w * 0.03))
        self.rect = pygame.Rect(max(0, self.x - width // 2), 0, width, h)
        try:
            self.charge_image = pygame.transform.scale(load_image("Heavenly Light.png"), (64, 64))
            self.attack_image = pygame.transform.scale(load_image("Lightning Strike.png"), (self.rect.width, self.rect.height))
        except Exception:
            pass

    def draw(self, surf: pygame.Surface):
        if self.state == "charging":
            # show the charge image near the top of the strike
            if self.charge_image:
                surf.blit(self.charge_image, (self.x - 32, 30))
            else:
                pygame.draw.rect(surf, YELLOW, pygame.Rect(self.x - 4, 0, 8, 40))
        elif self.state == "active":
            if self.attack_image:
                surf.blit(self.attack_image, self.rect.topleft)
            else:
                pygame.draw.rect(surf, YELLOW, self.rect)


# Entry point
if __name__ == "__main__":
    game = Game((1000, 800))
    game.run()

