(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;
  const tileSize = 16;
  const mapRows = [
    "####################",
    "#S..o....#....o...E#",
    "#......###.........#",
    "#..####......###...#",
    "#........o.........#",
    "#.....###......o...#",
    "#...............####",
    "#..o......###......#",
    "#....###...........#",
    "#..........o.......#",
    "#.####........###..#",
    "#.............^....#",
    "#...o....###.......#",
    "#^^^^....#....o....#",
    "####################",
  ];

  function buildLevel() {
    const tiles = mapRows.map((row) => row.split(""));
    const collectibles = [];
    let start = { x: 24, y: 24 };
    let exit = { x: 280, y: 24, w: 14, h: 14 };

    tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === "S") {
          start = { x: x * tileSize + 2, y: y * tileSize + 1 };
          tiles[y][x] = ".";
        } else if (tile === "o") {
          collectibles.push({
            x: x * tileSize + 4,
            y: y * tileSize + 4,
            w: 8,
            h: 8,
            found: false,
          });
          tiles[y][x] = ".";
        } else if (tile === "E") {
          exit = { x: x * tileSize + 2, y: y * tileSize + 2, w: 12, h: 12 };
          tiles[y][x] = ".";
        }
      });
    });

    return { tiles, collectibles, start, exit };
  }

  function createState() {
    const level = buildLevel();
    return {
      phase: "ready",
      tiles: level.tiles,
      collectibles: level.collectibles,
      exit: level.exit,
      start: level.start,
      player: {
        x: level.start.x,
        y: level.start.y,
        w: 12,
        h: 12,
        vx: 0,
        vy: 0,
        onGround: false,
      },
      jumpQueued: false,
      lives: 3,
      collected: 0,
      total: level.collectibles.length,
    };
  }

  function overlappingTiles(state, bounds, filter) {
    const hits = [];
    const startX = Math.floor(bounds.x / tileSize);
    const endX = Math.floor((bounds.x + bounds.w - 1) / tileSize);
    const startY = Math.floor(bounds.y / tileSize);
    const endY = Math.floor((bounds.y + bounds.h - 1) / tileSize);

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const row = state.tiles[y];
        const tile = row && row[x];
        if (tile && filter(tile)) {
          hits.push({
            x: x * tileSize,
            y: y * tileSize,
            w: tileSize,
            h: tileSize,
            tile,
          });
        }
      }
    }

    return hits;
  }

  function resetPlayer(state) {
    state.player.x = state.start.x;
    state.player.y = state.start.y;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.onGround = false;
    state.jumpQueued = false;
  }

  function loseLife(state, audio) {
    state.lives -= 1;
    if (state.lives <= 0) {
      state.phase = "gameover";
      audio.play("error");
    } else {
      resetPlayer(state);
      state.phase = "ready";
      audio.play("loseLife");
    }
  }

  root.registerGame({
    id: "spring-dot",
    title: "Spring Dot",
    menuTitle: "Spring Dot",
    tagline: "Bounce platformer",
    description: "A one-screen platform run with a springy orb, collectible chips, spikes, and a locked exit.",
    instructions: [
      "Roll and jump around the level to collect every chip.",
      "Spikes cost a life, and the exit only opens after every chip is found.",
      "Use Enter or Space to jump when grounded.",
    ],
    controls: [
      "Left / Right: move",
      "Up / Enter / Space: jump",
      "R: reset level",
      "Escape: return to menu",
    ],
    createState() {
      return createState();
    },
    handleInput(state, action, input, engine, audio) {
      if (state.phase === "ready") {
        if (action === "primary" || action === "secondary") {
          state.phase = "playing";
          state.jumpQueued = true;
          audio.play("launch");
        }
        return;
      }

      if (state.phase === "win" || state.phase === "gameover") {
        if (action === "primary" || action === "secondary") {
          const next = createState();
          Object.assign(state, next);
          state.phase = "playing";
          audio.play("launch");
        }
        return;
      }

      if (action === "up" || action === "primary" || action === "secondary") {
        state.jumpQueued = true;
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing") {
        return;
      }

      const moveSpeed = 94;
      if (input.held.left) {
        state.player.vx = -moveSpeed;
      } else if (input.held.right) {
        state.player.vx = moveSpeed;
      } else {
        state.player.vx *= 0.82;
      }

      if (state.jumpQueued && state.player.onGround) {
        state.player.vy = -190;
        state.player.onGround = false;
        state.jumpQueued = false;
        audio.play("move");
      }

      state.player.vy += 380 * dt;

      state.player.x += state.player.vx * dt;
      overlappingTiles(state, state.player, (tile) => tile === "#").forEach((solid) => {
        if (!utils.rectsOverlap(state.player, solid)) {
          return;
        }

        if (state.player.vx > 0) {
          state.player.x = solid.x - state.player.w;
        } else if (state.player.vx < 0) {
          state.player.x = solid.x + solid.w;
        }
        state.player.vx = 0;
      });

      state.player.y += state.player.vy * dt;
      state.player.onGround = false;
      overlappingTiles(state, state.player, (tile) => tile === "#").forEach((solid) => {
        if (!utils.rectsOverlap(state.player, solid)) {
          return;
        }

        if (state.player.vy > 0) {
          state.player.y = solid.y - state.player.h;
          state.player.onGround = true;
        } else if (state.player.vy < 0) {
          state.player.y = solid.y + solid.h;
        }
        state.player.vy = 0;
      });

      state.jumpQueued = false;

      const hazardHit = overlappingTiles(state, state.player, (tile) => tile === "^").some((hazard) => utils.rectsOverlap(state.player, hazard));
      if (hazardHit) {
        loseLife(state, audio);
        return;
      }

      state.collectibles.forEach((item) => {
        if (!item.found && utils.rectsOverlap(state.player, item)) {
          item.found = true;
          state.collected += 1;
          audio.play("success");
        }
      });

      if (state.player.y > 240) {
        loseLife(state, audio);
        return;
      }

      if (state.collected === state.total && utils.rectsOverlap(state.player, state.exit)) {
        state.phase = "win";
        audio.play("success");
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Spring Dot", `${state.collected}/${state.total} chips`);

      state.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
          const px = x * tileSize;
          const py = y * tileSize;
          if (tile === "#") {
            ctx.fillStyle = "#20301f";
            ctx.fillRect(px, py, tileSize, tileSize);
          } else if (tile === "^") {
            ctx.fillStyle = "#4c2d19";
            ctx.beginPath();
            ctx.moveTo(px, py + tileSize);
            ctx.lineTo(px + tileSize / 2, py + 3);
            ctx.lineTo(px + tileSize, py + tileSize);
            ctx.fill();
          }
        });
      });

      state.collectibles.forEach((item) => {
        if (!item.found) {
          ctx.fillStyle = "#445f36";
          ctx.fillRect(item.x, item.y, item.w, item.h);
        }
      });

      ctx.strokeStyle = state.collected === state.total ? "#20301f" : "rgba(32, 48, 31, 0.38)";
      ctx.strokeRect(state.exit.x, state.exit.y, state.exit.w, state.exit.h);
      if (state.collected === state.total) {
        ctx.fillStyle = "#20301f";
        ctx.fillRect(state.exit.x + 2, state.exit.y + 2, state.exit.w - 4, state.exit.h - 4);
      }

      ctx.fillStyle = "#20301f";
      ctx.beginPath();
      ctx.arc(state.player.x + 6, state.player.y + 6, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText(`Lives ${state.lives}`, 12, 232);
      ctx.textAlign = "right";
      ctx.fillText(state.collected === state.total ? "Exit open" : "Collect all chips", 308, 232);
      ctx.textAlign = "left";

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Stage Start",
          lines: ["Collect every chip.", "Avoid spikes.", "Press Enter"],
          footer: "Exit opens at 100%",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Stage Lost",
          lines: [`Chips ${state.collected}/${state.total}`, "Press Enter to retry"],
          footer: "Esc returns",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Stage Clear",
          lines: ["Every chip recovered.", "The orb reached the gate."],
          footer: "Enter plays again",
        });
      }
    },
  });
})();
