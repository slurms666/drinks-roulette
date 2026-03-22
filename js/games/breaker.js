(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;

  function buildBricks() {
    const bricks = [];
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        bricks.push({
          x: 28 + col * 34,
          y: 40 + row * 16,
          w: 28,
          h: 10,
          alive: true,
        });
      }
    }
    return bricks;
  }

  function createState() {
    return {
      phase: "ready",
      bricks: buildBricks(),
      paddle: { x: 132, y: 206, w: 56, h: 8 },
      ball: { x: 160, y: 200, r: 4, vx: 82, vy: -140 },
      lives: 3,
      score: 0,
    };
  }

  function serveBall(state) {
    state.phase = "playing";
    state.ball.x = state.paddle.x + state.paddle.w / 2;
    state.ball.y = state.paddle.y - 8;
    state.ball.vx = utils.pick([-92, -78, 78, 92]);
    state.ball.vy = -148;
  }

  function resetServe(state) {
    state.phase = "ready";
    state.ball.x = state.paddle.x + state.paddle.w / 2;
    state.ball.y = state.paddle.y - 8;
    state.ball.vx = 82;
    state.ball.vy = -140;
  }

  root.registerGame({
    id: "wall-breaker",
    title: "Wall Breaker",
    menuTitle: "Wall Breaker",
    tagline: "Brick breaker",
    description: "A compact paddle-and-ball game with a full brick wall and quick, replayable rounds.",
    instructions: [
      "Keep the ball alive with the paddle and clear every brick.",
      "Enter or Space launches from the ready state.",
      "The ball speed changes with where it hits the paddle.",
    ],
    controls: [
      "Left / Right: move paddle",
      "Enter / Space: launch ball",
      "R: restart wall",
      "Escape: quit game",
    ],
    createState() {
      return createState();
    },
    handleInput(state, action, input, engine, audio) {
      if (state.phase === "ready") {
        if (action === "primary" || action === "secondary") {
          serveBall(state);
          audio.play("launch");
        }
        return;
      }

      if (state.phase === "win" || state.phase === "gameover") {
        if (action === "primary" || action === "secondary") {
          const next = createState();
          Object.assign(state, next);
          serveBall(state);
          audio.play("launch");
        }
      }
    },
    update(state, dt, input, audio) {
      const moveSpeed = 180;
      if (input.held.left) {
        state.paddle.x -= moveSpeed * dt;
      }
      if (input.held.right) {
        state.paddle.x += moveSpeed * dt;
      }
      state.paddle.x = utils.clamp(state.paddle.x, 16, 248);

      if (state.phase === "ready") {
        state.ball.x = state.paddle.x + state.paddle.w / 2;
        state.ball.y = state.paddle.y - 8;
        return;
      }

      if (state.phase !== "playing") {
        return;
      }

      state.ball.x += state.ball.vx * dt;
      state.ball.y += state.ball.vy * dt;

      if (state.ball.x - state.ball.r <= 12 || state.ball.x + state.ball.r >= 308) {
        state.ball.vx *= -1;
        audio.play("move");
      }

      if (state.ball.y - state.ball.r <= 28) {
        state.ball.vy = Math.abs(state.ball.vy);
        audio.play("move");
      }

      if (state.ball.y + state.ball.r >= 240) {
        state.lives -= 1;
        if (state.lives <= 0) {
          state.phase = "gameover";
          audio.play("error");
        } else {
          resetServe(state);
          audio.play("loseLife");
        }
        return;
      }

      const paddleRect = state.paddle;
      const ballRect = {
        x: state.ball.x - state.ball.r,
        y: state.ball.y - state.ball.r,
        w: state.ball.r * 2,
        h: state.ball.r * 2,
      };

      if (state.ball.vy > 0 && utils.rectsOverlap(ballRect, paddleRect)) {
        const offset = (state.ball.x - (state.paddle.x + state.paddle.w / 2)) / (state.paddle.w / 2);
        state.ball.vx = offset * 150;
        state.ball.vy = -Math.abs(state.ball.vy);
        state.ball.y = state.paddle.y - state.ball.r - 1;
        audio.play("hit");
      }

      state.bricks.forEach((brick) => {
        if (!brick.alive) {
          return;
        }

        const hit = utils.rectsOverlap(ballRect, brick);
        if (!hit) {
          return;
        }

        brick.alive = false;
        state.score += 25;

        const dx = state.ball.x - (brick.x + brick.w / 2);
        const dy = state.ball.y - (brick.y + brick.h / 2);
        if (Math.abs(dx / brick.w) > Math.abs(dy / brick.h)) {
          state.ball.vx *= -1;
        } else {
          state.ball.vy *= -1;
        }
        audio.play("break");
      });

      if (state.bricks.every((brick) => !brick.alive)) {
        state.phase = "win";
        audio.play("success");
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Wall Breaker", `Lives ${state.lives}`);

      state.bricks.forEach((brick, index) => {
        if (!brick.alive) {
          return;
        }

        ctx.fillStyle = index % 2 === 0 ? "#20301f" : "#445f36";
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      });

      ctx.fillStyle = "#20301f";
      ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h);
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText(`Score ${state.score}`, 18, 230);
      ctx.textAlign = "right";
      ctx.fillText(`${state.bricks.filter((brick) => brick.alive).length} bricks left`, 302, 230);
      ctx.textAlign = "left";

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Serve",
          lines: ["Move the paddle.", "Launch with Enter or Space.", "Press Enter"],
          footer: "Clear the full wall",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Ball Lost",
          lines: [`Score ${state.score}`, "Press Enter to replay"],
          footer: "Esc returns",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Wall Down",
          lines: [`Score ${state.score}`, "Every brick cleared."],
          footer: "Enter plays again",
        });
      }
    },
  });
})();
