# M2b Gate Playthrough Script

Goal: visit every scene, save at every boundary, reload, verify same state.

## Fresh run

1. Launch `npm run dev`, open browser.
2. Title → any key → CharCreate → Cycle Paint twice → Launch.
3. SpaceScene: W thrust toward The Crossing (center of sector).
4. Prompt shows `[F] Dock — The Crossing` → F.
5. StationScene: click Ship Loadout.
6. ShipLoadoutScene: install Pulse Laser I → verify power budget updates → install Shield Cap I → verify slot count W 1/2, I 1/2 → ESC.
7. StationScene: pause (F10) → Save → pick Slot 1 → confirm.
8. Depart → SpaceScene.
9. W away from The Crossing, steer toward Tessra-3.
10. `[F] Land — Tessra-3` → F → PlanetLandingScene.
11. Landing Zone Alpha is disabled → Return to Orbit.
12. Steer to Kepler-7b → `[F] Explore Ruin` → F.
13. PlanetLandingScene → Enter Alien Ruin.
14. DungeonScene: WASD explore, walk through at least 2 doors.
15. ESC → PlanetLandingScene → ESC → SpaceScene.
16. Pause → Save → Slot 2 → confirm → Quit to Title.

## Reload verification

17. Title → Continue → Slot 1 → lands in StationScene at The Crossing.
18. Open Ship Loadout → Pulse Laser I still installed, Shield Cap I still installed.
19. Depart → Quit to Title.
20. Continue → Slot 2 → lands in SpaceScene near Kepler-7b (save v2 currently persists scene type but not in-scene ship position — M2c work).

## Pass criteria

- All 20 steps complete without crash.
- Step 18 confirms loadout persistence across save/reload.
- No audio crashes from missing files (silent fallback path holds).
- No console errors from seeded RNG callers (SpaceScene trader reseeding).

## Known M2b simplifications (not failures)

- Loadout **module ids** are currently not serialized into `SaveSnapshot.ship.moduleIds` — the save picker restores scene type + captain + seed, and the loaded run starts with a fresh `Loadout(shrike)` plus the base reactor. Full module persistence is an M2c save-v3 task.
- DungeonScene door-to-door spawn uses "first door of new room, one tile inward" — rooms don't line up geometrically. Replaced by proper door-pair indexing in M2c.
- `Landing Zone Alpha` on Tessra-3 is a disabled stub button.
- Audio files are intentionally absent; `audio.load` 404s are expected and swallowed.
