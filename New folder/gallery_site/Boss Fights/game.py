"""Game manager: main loop, player turn, collisions, UI."""
from __future__ import annotations

import pygame
pygame.init()
import random
from typing import List
from utils import load_image
from entities import Player, Boss, Minion
import attacks as attacks_mod


class Game:
    def __init__(self, size=(1000, 800)):
        self.screen = pygame.display.set_mode(size, pygame.RESIZABLE)
        pygame.display.set_caption("Boss Fights - Prototype")
        self.clock = pygame.time.Clock()
        self.running = True
        self.player = Player(self.screen.get_size())
        # Zeus setup: use classes from attacks module
        self.boss = Boss("Zeus", "Storm God-King of Olympus", 10, 40, 10, 5, 10, (255, 255, 0), "Zeus Boss Image.png", "philipe_sca",
                         attacks=[attacks_mod.LightningStrikeAttack, lambda: attacks_mod.SideWallAttack(side=random.choice(("left","right"))), attacks_mod.HomingCloud, attacks_mod.RisingTornado, attacks_mod.MinionSpawn])
        self.minions: List[Minion] = []
        # UI images
        try:
            self.select_arrow = load_image("Select Arrow Icon.png")
        except Exception:
            self.select_arrow = None
        self.font = pygame.font.SysFont(None, 20)
        # player-turn state
        self.player_turn = False
        self.target_index = 0  # 0 = boss, 1+ = minions

    def boss_img_center_x(self) -> int:
        w, _ = self.screen.get_size()
        return w // 2

    def add_minion(self, minion: Minion) -> None:
        minion.ensure_image((80, 80))
        self.minions.append(minion)

    def handle_events(self) -> None:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.VIDEORESIZE:
                self.screen = pygame.display.set_mode((event.w, event.h), pygame.RESIZABLE)
                self.player = Player(self.screen.get_size())
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN and self.player.attack_gauge >= 100 and not self.player_turn:
                    # enter player turn
                    self.player_turn = True
                    self.target_index = 0
                elif self.player_turn:
                    if event.key == pygame.K_LEFT:
                        # select left
                        self.target_index = max(0, self.target_index - 1)
                    elif event.key == pygame.K_RIGHT:
                        self.target_index = min(len(self.minions), self.target_index + 1)
                    elif event.key == pygame.K_SPACE:
                        # commit attack
                        self.player_attack()
                        self.player_turn = False

        # continuous movement
        keys = pygame.key.get_pressed()
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            self.player.move(-self.player.speed, self.screen.get_width())
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            self.player.move(self.player.speed, self.screen.get_width())

    def update(self) -> None:
        # if not player turn, enemy attacks continue and gauge builds
        if not self.player_turn:
            self.boss.update(self)
            for atk in list(self.boss.active_attacks):
                if atk.state == "active":
                    if atk.check_collision_with_player(self.player):
                        # apply damage and finish attack
                        self.player.hp -= getattr(atk, "damage", 0)
                        atk.state = "finished"
            # minions behavior
            for m in list(self.minions):
                if random.random() < 0.01:
                    m.schedule_attack(attacks_mod.EagleGustAttack, self)
                # remove dead minions
                if m.hp <= 0:
                    self.minions.remove(m)
            # build gauge slowly while surviving
            if self.player.hp > 0:
                self.player.attack_gauge = min(100.0, self.player.attack_gauge + 0.35)
        else:
            # during player turn, enemy attacks may pause; we keep boss.active_attacks at whatever state
            pass

        # check win/lose
        if self.player.hp <= 0:
            print("Player defeated.")
            self.running = False
        if self.boss.hp <= 0:
            print("Boss defeated.")
            self.running = False

    def player_attack(self) -> None:
        # simple fixed damage attack: reduce hp of selected target
        dmg = 25 + int(self.player.attack_gauge * 0.1)
        if self.target_index == 0:
            self.boss.take_damage(dmg)
        else:
            idx = self.target_index - 1
            if 0 <= idx < len(self.minions):
                self.minions[idx].take_damage(dmg)
                if self.minions[idx].hp <= 0:
                    # absorb mechanic: restore a bit of boss HP
                    self.boss.hp = min(100, self.boss.hp + 5)
                    self.minions.pop(idx)
        # reset gauge after attack
        self.player.attack_gauge = 0.0

    def draw_ui(self) -> None:
        hp_text = f"HP: {int(self.player.hp)}"
        gauge_text = f"Gauge: {int(self.player.attack_gauge)}%"
        hp_surf = self.font.render(hp_text, True, (255, 255, 255))
        gauge_surf = self.font.render(gauge_text, True, (255, 255, 255))
        self.screen.blit(hp_surf, (10, 10))
        self.screen.blit(gauge_surf, (10, 30))
        if self.player_turn:
            prompt = self.font.render("Player Turn - Use ← → to choose target, SPACE to attack", True, (255, 255, 255))
            self.screen.blit(prompt, (10, 50))

    def draw(self) -> None:
        self.screen.fill((30, 30, 40))
        self.boss.draw(self)
        for atk in self.boss.active_attacks:
            if atk.state in ("charging", "active"):
                atk.draw(self.screen)
        # draw minions
        x = 20
        for i, m in enumerate(self.minions):
            self.screen.blit(m.image, (x, 60))
            # show HP
            hp_surf = self.font.render(str(int(m.hp)), True, (255, 255, 255))
            self.screen.blit(hp_surf, (x + 20, 140))
            # show selection arrow if player_turn and selected
            if self.player_turn and self.target_index == i + 1:
                if self.select_arrow:
                    self.screen.blit(self.select_arrow, (x + 20, 40))
                else:
                    pygame.draw.polygon(self.screen, (255, 255, 255), [(x + 24, 48), (x + 14, 64), (x + 34, 64)])
            x += 90
        # draw player
        self.player.draw(self.screen)
        # draw player-turn target arrow over boss if selected
        if self.player_turn and self.target_index == 0:
            w, _ = self.screen.get_size()
            if self.select_arrow:
                self.screen.blit(self.select_arrow, (w // 2 - 32, 40))
            else:
                pygame.draw.polygon(self.screen, (255, 255, 255), [(w // 2, 48), (w // 2 - 12, 64), (w // 2 + 12, 64)])
        self.draw_ui()
        fps_surf = self.font.render(str(int(self.clock.get_fps())), True, (255, 255, 255))
        self.screen.blit(fps_surf, (self.screen.get_width() - 30, 10))

    def run(self) -> None:
        while self.running:
            dt = self.clock.tick(60)
            self.handle_events()
            self.update()
            self.draw()
            pygame.display.flip()
        pygame.quit()


if __name__ == "__main__":
    g = Game()
    g.run()
