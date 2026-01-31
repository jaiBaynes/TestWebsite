Boss Fights — Web build instructions

Dev (live edits):
- pip3 install --user --upgrade pygbag
- cd "Boss Fights"
- pygbag ./ --dev
- Open http://localhost:8000 in a browser and/or visit the Games page and click "Use Local Dev Server" to serve the live dev build into the iframe.

Build (copy static files into Rails public):
- From the project root run:
  - bundle exec rake games:build_bossfights
- This copies the static build to public/games/bossfights so the game is served by Rails at /games/bossfights/

Notes:
- The game uses an async entrypoint (`main.py`) to be compatible with pygbag.
- To mute during testing: use the "Mute game" checkbox on the games page (unloads/reloads the iframe).
- If you want a CI step, I can add a GitHub Action to run the build and commit the `public/games/bossfights` artifacts automatically (optional).
