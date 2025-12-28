"""Utility helpers for Boss Fights project."""
import os
import pygame
from typing import Tuple

BASE_DIR = os.path.dirname(__file__)


def load_image(name: str) -> pygame.Surface:
    """Load image and return a Surface with alpha. Raises on missing file."""
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
