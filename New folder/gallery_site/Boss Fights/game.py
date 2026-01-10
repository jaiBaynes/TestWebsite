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
        # Boss selection is driven externally (e.g., website). Use config.DEFAULT_BOSS.
        from config import DEFAULT_BOSS
        self.boss: Boss = self.create_boss(DEFAULT_BOSS)
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

    def turn_swap(self):
        if self.player_turn:
            self.player_turn = False
        else:
            self.player_turn = True
        self.player.player_turn = self.player_turn
        
    def boss_img_center_x(self) -> int:
        w, _ = self.screen.get_size()
        return w // 2

    def create_boss(self, name: str) -> Boss:
        """Factory to create bosses by name."""
        if name == "Zeus":
            return Boss("Zeus", "Storm God-King of Olympus", 12, 45, 12, 6, 12, (255, 255, 0), "Zeus Boss Image.png", "philipe_sca",
                        attacks=[attacks_mod.LightningStrikeAttack, lambda: attacks_mod.SideWallAttack(side=random.choice(("left","right"))), attacks_mod.HomingCloud, attacks_mod.RisingTornado, attacks_mod.MinionSpawn])
        elif name == "Hades":
            return Boss("Hades", "Lord of the Underworld", 15, 60, 8, 8, 14, (200, 80, 40), "Hades Boss Image.png", "me_placeholder",
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
                # clear cached scaled images so they're re-created at the new size
                if self.boss:
                    self.boss.image = None
                for m in self.minions:
                    m.image = None
                # clear derived caches
                if hasattr(self, '_hp_bar_cache'):
                    self._hp_bar_cache = {}
                # clear utils image cache as well in case of stale scaled versions
                try:
                    from utils import _IMAGE_CACHE
                    _IMAGE_CACHE.clear()
                except Exception:
                    pass
            elif event.type == pygame.KEYDOWN:
                # player-turn toggles
                if event.key == pygame.K_RETURN and self.player.attack_gauge >= 100 and not self.player_turn:
                    # enter player turn
                    self.turn_swap()
                    self.target_index = 0
                elif self.player_turn:
                    if event.key == pygame.K_LEFT:
                        # select left
                        self.target_index = max(0, self.target_index - 1)
                    elif event.key == pygame.K_RIGHT:
                        self.target_index = min(len(self.minions), self.target_index + 1)
                    elif event.key == pygame.K_h:
                        self.player.hp = self.player.max_hp
                        self.player.attack_gauge = 0.0
                        self.turn_swap()
                    elif event.key == pygame.K_SPACE:
                        # commit attack
                        self.player_attack()
                        self.turn_swap()
                        if self.boss.hp <= 0:
                            print("Boss defeated.")
                            self.running = False                        

        # continuous movement
        keys = pygame.key.get_pressed()
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            self.player.move(-self.player.speed, self.screen.get_width())
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            self.player.move(self.player.speed, self.screen.get_width())
        if keys[pygame.K_s] or keys[pygame.K_DOWN]:
            self.player.move_vertical(self.player.speed, self.screen.get_width()) 
        if keys[pygame.K_w] or keys[pygame.K_UP]:
            self.player.move_vertical(-self.player.speed, self.screen.get_width())           

    def update(self) -> None:
        # update player statuses first (DoT / stun duration)
        self.player.update_statuses()

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
        # ensure cached images are refreshed on any resize that changed screen size
        # (handled in VIDEORESIZE event as well, but clear here as additional safety)
        if self.boss and getattr(self.boss, 'image', None) is None:
            self.boss.ensure_image(self.screen.get_size())
        else:
            # during player turn, enemy attacks may pause; we keep boss.active_attacks at whatever state
            pass

        # check win/lose
        if self.player.hp <= 0:
            print("Player defeated.")
            self.running = False

    def player_attack(self) -> None:
        # simple fixed damage attack: reduce hp of selected target
        dmg = 25 + int(self.player.attack_gauge * 0.1)
        if self.target_index == 0:
            self.boss.take_damage(dmg)
            self.boss.active_attacks = []
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
        w, h = self.screen.get_size()

        # Boss HP bar at the top with current attack name beneath
        if self.boss:
            bar_w = int(w * 0.66)
            bar_h = 18
            x = (w - bar_w) // 2
            y = 8
            # try boss-specific HP bar images if mapped in config
            from config import BOSS_HP_BARS
            mapped = BOSS_HP_BARS.get(self.boss.name)
            frac = max(0.0, min(1.0, self.boss.hp / getattr(self.boss, 'max_hp', 100)))

            if mapped:
                # compute a frame height slightly taller than the fill bar (frame surrounds the thin fill)
                frame_h = max(bar_h + 8, int(bar_h * 3))
                # translucent backdrop sized for frame
                overlay = pygame.Surface((bar_w + 20, frame_h + 12), pygame.SRCALPHA)
                overlay.fill((0, 0, 0, 120))
                self.screen.blit(overlay, (x - 4, y - 4))

                # cache scaled frames/fills per boss+size to avoid repeated scaling
                cache_key = (self.boss.name, bar_w, bar_h, frame_h)
                if not hasattr(self, '_hp_bar_cache'):
                    self._hp_bar_cache = {}
                cached = self._hp_bar_cache.get(cache_key)
                if not cached:
                    try:
                        frame = load_image(mapped['frame'])
                        fill = load_image(mapped['fill'])
                        frame_scaled = pygame.transform.scale(frame, (bar_w*1.2, frame_h))
                        fill_scaled = pygame.transform.scale(fill, (bar_w, bar_h))
                        cached = {'frame': frame_scaled, 'fill': fill_scaled}
                        self._hp_bar_cache[cache_key] = cached
                    except Exception:
                        cached = None

                if cached:
                    frame_scaled = cached['frame']
                    fill_scaled = cached['fill']
                    fill_w = max(1, int(bar_w * frac))
                    fill_y = y + (frame_h - bar_h) // 2
                    self.screen.blit(fill_scaled.subsurface((0, 0, fill_w, bar_h)), (x, fill_y))
                    self.screen.blit(frame_scaled, (x - bar_w*0.1, y))
                    hp_text = f"HP {int(self.boss.hp)}/{int(getattr(self.boss,'max_hp',100))}"
                    hp_surf = self.font.render(hp_text, True, (255, 255, 255))
                    self.screen.blit(hp_surf, (x + bar_w // 2 - hp_surf.get_width() // 2, y + frame_h // 2 - hp_surf.get_height() // 2))
                else:
                    pygame.draw.rect(self.screen, (60, 60, 60), pygame.Rect(x, y, bar_w, bar_h))
                    pygame.draw.rect(self.screen, (200, 60, 60), pygame.Rect(x, y, int(bar_w * frac), bar_h))
            else:
                overlay = pygame.Surface((bar_w + 8, bar_h + 16), pygame.SRCALPHA)
                overlay.fill((0, 0, 0, 120))
                self.screen.blit(overlay, (x - 4, y - 4))
                pygame.draw.rect(self.screen, (60, 60, 60), pygame.Rect(x, y, bar_w, bar_h))
                pygame.draw.rect(self.screen, (200, 60, 60), pygame.Rect(x, y, int(bar_w * frac), bar_h))
                hp_text = f"HP {int(self.boss.hp)}/{int(getattr(self.boss,'max_hp',100))}"
                hp_surf = self.font.render(hp_text, True, (255, 255, 255))
                self.screen.blit(hp_surf, (x + bar_w // 2 - hp_surf.get_width() // 2, y + bar_h // 2 - hp_surf.get_height() // 2))

# show boss name above the frame and active attack centered beneath the frame
            name_surf = self.font.render(self.boss.name, True, (255, 255, 255))
            self.screen.blit(name_surf, (x + bar_w // 2 - name_surf.get_width() // 2, y - 18))
            # show active attack name (charging/active) or Idle centered below
            active_attack = None
            for atk in self.boss.active_attacks:
                if atk.state in ("charging", "active"):
                    active_attack = atk
                    break
            attack_text = f"{active_attack.name} ({active_attack.state})" if active_attack else "Idle"
            att_surf = self.font.render(attack_text, True, (220, 220, 220))
            # center under the frame (frame may be wider than bar)
            frame_center_x = x + (frame_scaled.get_width() if mapped and cached else bar_w) // 2
            att_x = frame_center_x - att_surf.get_width() // 2
            att_y = y + (frame_scaled.get_height() if mapped and cached else bar_h) + 6
            self.screen.blit(att_surf, (att_x, att_y))

        # Player's HP and gauge directly under the player's horizontal line (shorter width)
        player_x = int(self.player.x)
        player_y = int(self.player.y)
        # keep UI visible if player is near bottom
        hp_bar_y = player_y + 8
        if hp_bar_y + 60 > h:
            hp_bar_y = max(player_y - 70, h - 90)
        # reduce lengths by about half (previously up to 360 or 45% width)
        full_bar_w = min(360, int(w * 0.45))
        bar_w = max(80, int(full_bar_w * 0.5))
        hp_x = player_x - bar_w // 2
        # translucent backdrop
        overlay2 = pygame.Surface((bar_w + 8, 48), pygame.SRCALPHA)
        overlay2.fill((0, 0, 0, 110))
        self.screen.blit(overlay2, (hp_x - 4, hp_bar_y - 6))
        # HP bar (shorter)
        pygame.draw.rect(self.screen, (60, 60, 60), pygame.Rect(hp_x, hp_bar_y, bar_w, 12))
        hp_frac = max(0.0, min(1.0, self.player.hp / float(self.player.max_hp)))
        pygame.draw.rect(self.screen, (180, 40, 40), pygame.Rect(hp_x, hp_bar_y, int(bar_w * hp_frac), 12))
        hp_surf = self.font.render(f"HP {int(self.player.hp)}/{int(self.player.max_hp)}", True, (255, 255, 255))
        # center HP text inside bar
        self.screen.blit(hp_surf, (hp_x + bar_w // 2 - hp_surf.get_width() // 2, hp_bar_y + 6 - hp_surf.get_height() // 2))
        # Turn gauge under HP (centered on player.x, expands both ways) - shorter bar
        bar_y2 = hp_bar_y + 20
        frac = max(0.0, min(1.0, self.player.attack_gauge / 100.0))
        center_x = player_x
        bar_half = int(frac * bar_w / 2)
        # background full bar
        pygame.draw.rect(self.screen, (60, 60, 60), pygame.Rect(hp_x, bar_y2, bar_w, 10))
        filled_rect = pygame.Rect(center_x - bar_half, bar_y2, max(1, bar_half * 2), 10)
        pygame.draw.rect(self.screen, (120, 200, 60), filled_rect)
        perc_surf = self.font.render(f"{int(frac * 100)}%", True, (10, 10, 10))
        self.screen.blit(perc_surf, (center_x - perc_surf.get_width() // 2, bar_y2 + (10 - perc_surf.get_height()) // 2))

        if self.player_turn:
            prompt = self.font.render("Player Turn - Use ← → to choose target, SPACE to attack, H to heal", True, (255, 255, 255))
            self.screen.blit(prompt, (10, bar_y2 + 20))

    def draw(self) -> None:
        self.screen.fill((30, 30, 40))


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
            # show selection arrow if player_turn and selected (scaled to minion size)
            if self.player_turn and self.target_index == i + 1:
                arrow_w = int(m.image.get_width() * 0.6)
                arrow_h = int(arrow_w * 0.6)
                arrow_x = x + m.image.get_width() // 2 - arrow_w // 2
                arrow_y = 40
                if self.select_arrow:
                    # cache scaled arrow images by size to avoid repeated scaling
                    if not hasattr(self, '_arrow_cache'):
                        self._arrow_cache = {}
                    cache_key = (arrow_w, arrow_h)
                    if cache_key not in self._arrow_cache:
                        try:
                            self._arrow_cache[cache_key] = pygame.transform.scale(self.select_arrow, (arrow_w, arrow_h))
                        except Exception:
                            self._arrow_cache[cache_key] = None
                    scaled = self._arrow_cache.get(cache_key)
                    if scaled:
                        self.screen.blit(scaled, (arrow_x, arrow_y))
                    else:
                        # fallback polygon sized relative to minion
                        pygame.draw.polygon(self.screen, (255, 255, 255), [(arrow_x + arrow_w // 2, arrow_y), (arrow_x, arrow_y + arrow_h), (arrow_x + arrow_w, arrow_y + arrow_h)])
                else:
                    pygame.draw.polygon(self.screen, (255, 255, 255), [(arrow_x + arrow_w // 2, arrow_y), (arrow_x, arrow_y + arrow_h), (arrow_x + arrow_w, arrow_y + arrow_h)])
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
                iw, ih = 25,25
                icon = pygame.transform.scale(icon,(iw,ih))                
                pos = (icon_x - ((iw + spacing) * i) - iw // 2, icon_y)
                self.screen.blit(icon, pos)
            else:
                # fallback: render text
                st_surf = self.font.render(name, True, (255, 200, 60))
                pos = (icon_x - ((25 + spacing) * i) - 25 // 2, icon_y)
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
