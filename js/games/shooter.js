(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;

  function createState() {
    return {
      phase: "ready",
      player: { x: 32, y: 116, w: 18, h: 12, lives: 3, cooldown: 0 },
      bullets: [],
      enemies: [],
      stars: utils.createNoiseDots(26, 320, 240),
      spawnTimer: 0,
      elapsed: 0,
      score: 0,
      goal: 30,
    };
  }

  function fireBullet(state, audio) {
    if (state.player.cooldown > 0 || state.phase !== "playing") {
      return;
    }

    state.bullets.push({
      x: state.player.x + state.player.w,
      y: state.player.y + state.player.h / 2 - 1,
      w: 10,
      h: 2,
      speed: 220,
    });
    state.player.cooldown = 0.22;
    audio.play("select");
  }

  function spawnEnemy(state) {
    const variant = utils.pick([
      { w: 16, h: 12, speed: 62, hp: 1 },
      { w: 20, h: 14, speed: 80, hp: 2 },
      { w: 12, h: 10, speed: 100, hp: 1 },
    ]);

    state.enemies.push({
      x: 330,
      y: utils.randInt(30, 200),
      w: variant.w,
      h: variant.h,
      speed: variant.speed + state.elapsed * 0.6,
      hp: variant.hp,
    });
  }

  root.registerGame({
    id: "star-blaster",
    title: "Star Blaster",
    menuTitle: "Star Blaster",
    tagline: "Side shooter",
    description: "An original side-scrolling shooter with monochrome waves, light enemy traffic, and short arcade runs.",
    instructions: [
      "Move around the left side of the screen and blast incoming drones.",
      "Enter or Space fires. Enemies that hit you or slip past cost one life.",
      "Reach 30 points before all lives disappear.",
    ],
    controls: [
      "Arrows: move ship",
      "Enter / Space: fire",
      "R: restart wave",
      "Escape: back to the games list",
    ],
    createState() {
      return createState();
    },
    handleInput(state, action, input, engine, audio) {
      if (state.phase === "ready") {
        if (action === "primary" || action === "secondary") {
          state.phase = "playing";
          audio.play("launch");
        }
        return;
      }

      if (state.phase === "gameover" || state.phase === "win") {
        if (action === "primary" || action === "secondary") {
          const next = createState();
          Object.assign(state, next);
          state.phase = "playing";
          audio.play("launch");
        }
        return;
      }

      if (action === "primary" || action === "secondary") {
        fireBullet(state, audio);
      }
    },
    update(state, dt, input, audio) {
      state.stars.forEach((star) => {
        star.x -= star.speed * dt;
        if (star.x < -4) {
          star.x = 324;
          star.y = Math.random() * 240;
        }
      });

      if (state.phase !== "playing") {
        return;
      }

      state.elapsed += dt;
      state.player.cooldown = Math.max(0, state.player.cooldown - dt);

      const moveSpeed = 124;
      if (input.held.left) {
        state.player.x -= moveSpeed * dt;
      }
      if (input.held.right) {
        state.player.x += moveSpeed * dt;
      }
      if (input.held.up) {
        state.player.y -= moveSpeed * dt;
      }
      if (input.held.down) {
        state.player.y += moveSpeed * dt;
      }

      state.player.x = utils.clamp(state.player.x, 14, 110);
      state.player.y = utils.clamp(state.player.y, 28, 204);

      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnEnemy(state);
        state.spawnTimer = Math.max(0.28, 1.1 - state.elapsed * 0.02);
      }

      state.bullets.forEach((bullet) => {
        bullet.x += bullet.speed * dt;
      });
      state.bullets = state.bullets.filter((bullet) => bullet.x < 332);

      state.enemies.forEach((enemy) => {
        enemy.x -= enemy.speed * dt;
      });

      const survivors = [];
      state.enemies.forEach((enemy) => {
        let destroyed = false;

        state.bullets.forEach((bullet) => {
          if (!destroyed && utils.rectsOverlap(enemy, bullet)) {
            enemy.hp -= 1;
            bullet.x = 400;
            audio.play("hit");
            if (enemy.hp <= 0) {
              destroyed = true;
              state.score += 1;
              audio.play("success");
            }
          }
        });

        if (!destroyed && utils.rectsOverlap(enemy, state.player)) {
          destroyed = true;
          state.player.lives -= 1;
          audio.play("loseLife");
        }

        if (!destroyed && enemy.x + enemy.w < 0) {
          destroyed = true;
          state.player.lives -= 1;
          audio.play("loseLife");
        }

        if (!destroyed) {
          survivors.push(enemy);
        }
      });
      state.enemies = survivors;
      state.bullets = state.bullets.filter((bullet) => bullet.x < 332);

      if (state.player.lives <= 0) {
        state.phase = "gameover";
        audio.play("error");
      } else if (state.score >= state.goal) {
        state.phase = "win";
        audio.play("success");
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Star Blaster", `Lives ${state.player.lives}`);

      ctx.fillStyle = "rgba(32, 48, 31, 0.28)";
      state.stars.forEach((star) => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      ctx.fillStyle = "rgba(32, 48, 31, 0.18)";
      for (let i = 0; i < 6; i += 1) {
        ctx.fillRect(0, 30 + i * 32, 320, 1);
      }

      ctx.fillStyle = "#20301f";
      ctx.fillRect(state.player.x, state.player.y + 4, state.player.w, 4);
      ctx.fillRect(state.player.x + 4, state.player.y, 8, 12);
      ctx.fillRect(state.player.x + 14, state.player.y + 3, 6, 6);

      ctx.fillStyle = "#445f36";
      state.bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
      });

      state.enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.hp > 1 ? "#4c2d19" : "#2c432a";
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
        ctx.fillStyle = "#20301f";
        ctx.fillRect(enemy.x - 2, enemy.y + 4, 3, 3);
      });

      ctx.fillStyle = "#20301f";
      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText(`Score ${state.score}/${state.goal}`, 16, 230);
      ctx.textAlign = "right";
      ctx.fillText("Enter fire", 304, 230);
      ctx.textAlign = "left";

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Wave Start",
          lines: ["Move with arrows.", "Fire with Enter or Space.", "Press Enter"],
          footer: "Reach 30 points",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Signal Lost",
          lines: [`Score ${state.score}`, "Press Enter to replay"],
          footer: "Esc returns",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Sector Clear",
          lines: [`Score ${state.score}`, "All waves pushed back."],
          footer: "Enter launches again",
        });
      }
    },
  });
})();
