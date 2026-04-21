# M3a Planet Foundation Playthrough Script

Goal: platformer substrate works in one hand-authored room.

## Fresh run

1. `npm run dev`, browser open.
2. Title → any key → CharCreate → Launch.
3. In SpaceScene, fly toward Kepler-7b. F to explore ruin.
4. PlanetLandingScene: click "Enter Alien Ruin".
5. PlanetScene loads. Room is 20x12 gray tiles on dark red backdrop, yellow exit dot on the right.
6. A/D run left and right. Running speed is constant, not accelerating.
7. SPACE (or W) jumps. Jump is snappy — up quickly, hang briefly, fall. Gravity feels right.
8. Walk into the raised platform at column 4-6; jump onto it. Player lands cleanly without clipping.
9. Walk off the edge of a platform — there's a brief coyote window where you can still jump from nothing.
10. Press SPACE in mid-air right before landing — on touching ground, the buffered jump fires.
11. Walk into the yellow exit marker on the right wall. Scene returns to PlanetLandingScene.
12. Re-enter the ruin. Press ESC. Returns to PlanetLandingScene.

## Pass criteria

- All 12 steps complete without crash.
- No tunneling through walls even at high speed.
- Coyote time + jump buffer both observable.
- Worst frame ≤ 20 ms (check F3 from space, platformer is strictly cheaper).

## Known M3a simplifications (carried forward)

- Player is a colored rectangle. No sprite. Art pass in M3b.
- Exactly one room. Multi-room connections in M3c.
- No enemies, no combat, no hitboxes. M3b.
- No save points. Entering the ruin is a session-only state; quit-to-title and reload starts the ruin over. M3c save integration.
- No hazard tiles yet — Tiled tile id > 0 all maps to internal solid. M3b adds hazards.
- Tiles render as flat colored rectangles. No tileset atlas. Art pass.
