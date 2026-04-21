# M2c Gate Playthrough Script

Goal: combat feels right; damage/shake/flash/pause all wired; save v3 round-trips.

## Fresh run

1. `npm run dev`, browser open.
2. Title → any key → CharCreate → Launch.
3. Dock at The Crossing → Ship Loadout → install Pulse Laser I → ESC → Depart.
4. Fly toward the rusher at (1400, 700). Verify it chases you (red square).
5. Space to fire. Three hits should kill the rusher. Yellow muzzle flash on fire, white hit flash on kill.
6. Fly toward the shooter at (1700, 900). It should approach, stop, and strafe. Its projectiles should fly toward your last known position.
7. Take a hit. Verify: screen shakes, red vignette flashes, HP/shield bar moves.
8. Kill the shooter. Verify: 5 hits of 8 damage = 40 total, shooter has 30 hp + 10 shield = 40.
9. Let a rusher contact-hit you. Verify: big shake, big flash, rusher dies on impact.
10. Press P (tactical pause). Verify: time freezes, ship can still rotate with A/D, dashed yellow fire-line shows predicted shot.
11. Press P to resume.
12. Pause → Save → Slot 1 → confirm → Quit to Title.
13. Continue → Slot 1 → should restore: player HP/shield, dead enemies still dead, live enemies at last positions, loadout intact.
14. Let yourself die. Verify: transitions to Title.

## Pass criteria

- All 14 steps complete without crash.
- Step 13 shows correct HP and correct enemy set.
- Worst frame ≤ 20 ms with all 4 enemies alive, ~10 projectiles in flight. Check F3.

## Known M2c simplifications

- Dungeon HP/combat deferred (M2d).
- Player death → TitleScene is a stub; real permadeath/legacy comes later.
- `availablePower` in `canFire` is hardcoded to 100 for now. PowerBudget integration is an M2d polish task.
- Tactical pause is keyboard-only; gamepad-style aiming is future work.
