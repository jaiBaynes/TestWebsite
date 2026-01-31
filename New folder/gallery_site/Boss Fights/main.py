"""Pygbag-compatible async entrypoint for Boss Fights.

This file provides an async `main()` that runs the existing Game loop in an
async-friendly way so it can be packaged with pygbag for the web.
"""
import asyncio
import pygame
from game import Game

async def main():
    g = Game()
    try:
        while g.running:
            dt = g.clock.tick(60)
            g.handle_events()
            g.update()
            g.draw()
            pygame.display.flip()
            # Yield to the browser/event loop — required for pygbag
            await asyncio.sleep(0)
    except Exception as e:
        print('Error in async main loop:', e)

# Support running standalone for local testing with python
if __name__ == '__main__':
    asyncio.run(main())
