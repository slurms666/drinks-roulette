(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;
  const cell = 14;
  const cols = 20;
  const rows = 15;
  const boardX = 20;
  const boardY = 22;

  function randomFood(state) {
    let food = null;

    while (!food) {
      const candidate = {
        x: utils.randInt(0, cols - 1),
        y: utils.randInt(0, rows - 1),
      };

      const occupied = state.snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
      if (!occupied) {
        food = candidate;
      }
    }

    return food;
  }

  function buildState() {
    const state = {
      phase: "ready",
      snake: [
        { x: 10, y: 7 },
        { x: 9, y: 7 },
        { x: 8, y: 7 },
      ],
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      food: null,
      moveTimer: 0,
      speed: 0.16,
      score: 0,
      target: 12,
    };
    state.food = randomFood(state);
    return state;
  }

  function setDirection(state, x, y) {
    if (state.direction.x === -x && state.direction.y === -y) {
      return;
    }

    state.nextDirection = { x, y };
  }

  root.registerGame({
    id: "snake",
    title: "Snake",
    menuTitle: "Snake",
    tagline: "Grid crawler",
    description: "Collect fruit, grow the body, and survive the box without turning into your own tail.",
    instructions: [
      "Guide the snake with the arrow keys.",
      "The playfield wraps, so crossing an edge brings you back from the opposite side.",
      "Each fruit lengthens the body and nudges the speed upward.",
      "Crash into yourself and the run ends.",
      "Reach 12 fruit for a clean win.",
    ],
    controls: [
      "Arrows: steer",
      "Enter: start or replay",
      "Escape: leave the game",
      "R: restart instantly",
    ],
    createState() {
      return buildState();
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
          const next = buildState();
          Object.assign(state, next);
          state.phase = "playing";
          audio.play("launch");
        }
        return;
      }

      if (action === "up") {
        setDirection(state, 0, -1);
      } else if (action === "down") {
        setDirection(state, 0, 1);
      } else if (action === "left") {
        setDirection(state, -1, 0);
      } else if (action === "right") {
        setDirection(state, 1, 0);
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing") {
        return;
      }

      state.moveTimer += dt;
      if (state.moveTimer < state.speed) {
        return;
      }

      state.moveTimer = 0;
      state.direction = { x: state.nextDirection.x, y: state.nextDirection.y };

      const head = state.snake[0];
      const nextHead = {
        x: (head.x + state.direction.x + cols) % cols,
        y: (head.y + state.direction.y + rows) % rows,
      };

      const hitBody = state.snake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

      if (hitBody) {
        state.phase = "gameover";
        audio.play("error");
        return;
      }

      state.snake.unshift(nextHead);

      if (nextHead.x === state.food.x && nextHead.y === state.food.y) {
        state.score += 1;
        state.speed = Math.max(0.07, state.speed - 0.006);
        state.food = randomFood(state);
        audio.play("success");

        if (state.score >= state.target) {
          state.phase = "win";
        }
      } else {
        state.snake.pop();
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Snake", `${state.score}/${state.target}`);

      ctx.fillStyle = "rgba(35, 55, 33, 0.14)";
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          ctx.fillRect(boardX + x * cell, boardY + y * cell, cell - 2, cell - 2);
        }
      }

      ctx.fillStyle = "#20301f";
      state.snake.forEach((segment, index) => {
        const inset = index === 0 ? 1 : 2;
        ctx.fillRect(boardX + segment.x * cell + inset, boardY + segment.y * cell + inset, cell - inset * 2, cell - inset * 2);
      });

      ctx.fillStyle = "#4c2d19";
      ctx.fillRect(boardX + state.food.x * cell + 3, boardY + state.food.y * cell + 3, cell - 6, cell - 6);

      ctx.fillStyle = "#20301f";
      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText(`Speed ${Math.round((0.2 - state.speed) * 100)}`, 22, 232);
      ctx.textAlign = "right";
      ctx.fillText("R restart", 298, 232);
      ctx.textAlign = "left";

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Ready",
          lines: ["Eat 12 fruit.", "Edges wrap around.", "Press Enter"],
          footer: "Start run",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Game Over",
          lines: [`Score ${state.score}`, "Press Enter to retry"],
          footer: "Esc returns",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Clear",
          lines: [`Fruit ${state.score}`, "The snake owns the screen."],
          footer: "Enter plays again",
        });
      }
    },
  });
})();
