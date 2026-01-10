"""Utility helpers for Boss Fights project."""
import os
import pygame
from typing import Tuple

# Frames per second used throughout the game logic (used for status durations)
FPS = 60

BASE_DIR = os.path.dirname(__file__)

# simple in-memory cache for loaded images to avoid repeated disk loads
_IMAGE_CACHE: dict = {}


def load_image(name: str) -> pygame.Surface:
    """Load image and return a Surface with alpha. Raises on missing file.

    Caches images by path, returning the same Surface object on subsequent calls.
    This significantly reduces IO and parsing overhead.
    """
    path = os.path.join(BASE_DIR, name)
    if path in _IMAGE_CACHE:
        return _IMAGE_CACHE[path]
    surf = pygame.image.load(path).convert_alpha()
    _IMAGE_CACHE[path] = surf
    return surf


def rect_circle_collide(rect: pygame.Rect, circle_pos: Tuple[int, int], circle_radius: int) -> bool:
    """Return True if rect collides with circle (center+radius)."""
    cx, cy = circle_pos
    nearest_x = max(rect.left, min(cx, rect.right))
    nearest_y = max(rect.top, min(cy, rect.bottom))
    dx = cx - nearest_x
    dy = cy - nearest_y
    return dx * dx + dy * dy <= circle_radius * circle_radius
