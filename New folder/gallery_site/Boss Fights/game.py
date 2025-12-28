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
        # boss selection menu state
        self.available_bosses = ["Zeus", "Hades"]
        self.selected_boss_index = 0
        self.in_menu = True  # start in selection menu

        # initially no boss until selection
        self.boss: Boss | None = None
        self.minions: List[Minion] = []

        # UI images & element icons
        try:
            self.select_arrow = load_image("Select Arrow Icon.png")
        except Exception:
            self.select_arrow = None
        # elemental icons
        self.element_icons = {}
        try:
            self.element_icons['electric'] = load_image("Lightning Elemental Symbol.png")
        except Exception:
            self.element_icons['electric'] = None
        try:
            self.element_icons['wind'] = load_image("Wind Elemental Symbol.png")
        except Exception:
            self.element_icons['wind'] = None
        try:
            self.element_icons['fire'] = load_image("Fire Elemental Symbol.png")
        except Exception:
            self.element_icons['fire'] = None
        try:
            self.element_icons['poison'] = load_image("Poison Elemental Symbol.png")
        except Exception:
            self.element_icons['poison'] = None

        self.font = pygame.font.SysFont(None, 20)
        # player-turn state
        self.player_turn = False
        self.target_index = 0  # 0 = boss, 1+ = minions

    def boss_img_center_x(self) -> int:
        w, _ = self.screen.get_size()
        return w // 2

    def create_boss(self, name: str) -> Boss:
        """Factory to create bosses by name."""
        if name == "Zeus":
            return Boss("Zeus", "Storm God-King of Olympus", 12, 45, 12, 6, 12, (255, 255, 0), "Zeus Boss Image.png", "philipe_sca",
                        attacks=[attacks_mod.LightningStrikeAttack, lambda: attacks_mod.SideWallAttack(side=random.choice(("left","right"))), attacks_mod.HomingCloud, attacks_mod.RisingTornado, attacks_mod.MinionSpawn])
        elif name == "Hades":
            return Boss("Hades", "Lord of the Underworld", 15, 60, 8, 8, 14, (200, 80, 40), "Hades Boss Image.png", "mike_martin",
                        attacks=[attacks_mod.FireBlast, attacks_mod.FireWall, attacks_mod.BidentAttack, lambda: attacks_mod.MinionSpawn(minion_name='CerberusHead')])
        else:
            raise ValueError(f"Unknown boss: {name}")

    def add_minion(self, minion: Minion) -> None:
        """Add a minion and set sensible defaults per minion type (e.g., Aquila, CerberusHead)."""
        import attacks as attacks_mod
        # default attacks for Aquila
        if minion.name == "Aquila" and not minion.attacks:
            minion.attacks = [attacks_mod.EagleGustAttack]
        # default attacks for Cerberus head
        if minion.name == "CerberusHead" and not minion.attacks:
            # Cerberus head uses a small bident bite
            minion.attacks = [attacks_mod.BidentAttack]
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
                # If we're in the boss-selection menu, handle menu navigation and confirm
                if self.in_menu:
                    if event.key == pygame.K_LEFT or event.key == pygame.K_a:
                        self.selected_boss_index = max(0, self.selected_boss_index - 1)
                    elif event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                        self.selected_boss_index = min(len(self.available_bosses) - 1, self.selected_boss_index + 1)
                    elif event.key == pygame.K_RETURN:
                        chosen = self.available_bosses[self.selected_boss_index]
                        self.boss = self.create_boss(chosen)
                        self.in_menu = False
                        self.player_turn = False
                        self.target_index = 0
                    # ignore other keys while in menu
                else:
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
        # update player statuses first (DoT / stun duration)
        self.player.update_statuses()

        # if we're in the selection menu don't process boss/minion behavior yet
        if self.in_menu:
            return

        # if not player turn, enemy attacks continue and gauge builds
        if not self.player_turn:
            if self.boss:
                self.boss.update(self)
                for atk in list(self.boss.active_attacks):
                    if atk.state == "active":
                        if atk.check_collision_with_player(self.player):
                            # apply damage/effects and finish attack
                            atk.apply_to_player(self.player, self)
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
        if self.boss and self.boss.hp <= 0:
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
        # if in menu, draw selection screen and return
        if self.in_menu:
            title = self.font.render("Choose a Boss to Fight", True, (240, 240, 240))
            self.screen.blit(title, (self.screen.get_width() // 2 - title.get_width() // 2, 40))
            # draw boss choices horizontally
            spacing = 280
            start_x = self.screen.get_width() // 2 - spacing // 2
            y = 140
            for i, name in enumerate(self.available_bosses):
                label = self.font.render(name, True, (255, 255, 255))
                x = start_x + i * spacing
                rect = pygame.Rect(x - 40, y - 40, 160, 160)
                # box background
                color = (80, 60, 60) if i != self.selected_boss_index else (120, 100, 40)
                pygame.draw.rect(self.screen, color, rect)
                # try to show boss image if available
                try:
                    img = load_image(f"{name} Boss Image.png")
                    iw, ih = img.get_size()
                    self.screen.blit(img, (x - iw // 2 + 40, y - ih // 2))
                except Exception:
                    pass
                self.screen.blit(label, (x + 40 - label.get_width() // 2, y + 70))
            hint = self.font.render("Use ← → to select, ENTER to confirm", True, (200, 200, 200))
            self.screen.blit(hint, (self.screen.get_width() // 2 - hint.get_width() // 2, y + 120))
            return

        # normal gameplay drawing
        if self.boss:
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
        # draw player status icons above the player
        icon_x = int(self.player.x)
        icon_y = int(self.player.y) - 44
        spacing = 6
        i = 0
        for name, data in self.player.statuses.items():
            # map status to element icon
            icon = None
            if name == 'stun':
                icon = self.element_icons.get('electric')
            elif name == 'burn':
                icon = self.element_icons.get('fire')
            elif name == 'poison':
                icon = self.element_icons.get('poison')
            elif name == 'wind':
                icon = self.element_icons.get('wind')
            if icon:
                iw, ih = icon.get_size()
                pos = (icon_x - ((iw + spacing) * i) - iw // 2, icon_y)
                self.screen.blit(icon, pos)
            else:
                # fallback: render text
                st_surf = self.font.render(name, True, (255, 200, 60))
                pos = (icon_x - ((st_surf.get_width() + spacing) * i) - st_surf.get_width() // 2, icon_y)
                self.screen.blit(st_surf, pos)
            i += 1

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
