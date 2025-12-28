"""Entry script: minimal wrapper that launches the modularized game."""

from game import Game

if __name__ == "__main__":
    game = Game((1000, 800))
    game.run()

