(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;

  const shapes = [
    [[1, 1, 1, 1]],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
  ];

  function emptyBoard() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  function cloneShape(shape) {
    return shape.map((row) => row.slice());
  }

  function createPiece() {
    const matrix = cloneShape(utils.pick(shapes));
    return {
      matrix,
      x: Math.floor((10 - matrix[0].length) / 2),
      y: 0,
    };
  }

  function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        rotated[x][rows - 1 - y] = matrix[y][x];
      }
    }

    return rotated;
  }

  function createState() {
    return {
      phase: "ready",
      board: emptyBoard(),
      current: createPiece(),
      next: createPiece(),
      score: 0,
      lines: 0,
      targetLines: 12,
      dropTimer: 0,
      dropInterval: 0.62,
    };
  }

  function canPlace(board, piece) {
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) {
          continue;
        }

        const boardX = piece.x + x;
        const boardY = piece.y + y;

        if (boardX < 0 || boardX >= 10 || boardY < 0 || boardY >= 20) {
          return false;
        }

        if (board[boardY][boardX]) {
          return false;
        }
      }
    }

    return true;
  }

  function mergePiece(state) {
    state.current.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          state.board[state.current.y + y][state.current.x + x] = 1;
        }
      });
    });
  }

  function clearLines(state) {
    let cleared = 0;

    for (let y = state.board.length - 1; y >= 0; y -= 1) {
      if (state.board[y].every(Boolean)) {
        state.board.splice(y, 1);
        state.board.unshift(Array(10).fill(0));
        cleared += 1;
        y += 1;
      }
    }

    if (cleared > 0) {
      state.lines += cleared;
      state.score += cleared * 100;
      state.dropInterval = Math.max(0.16, state.dropInterval - cleared * 0.025);
    }
  }

  function spawnNext(state, audio) {
    state.current = state.next;
    state.next = createPiece();
    state.current.x = Math.floor((10 - state.current.matrix[0].length) / 2);
    state.current.y = 0;

    if (!canPlace(state.board, state.current)) {
      state.phase = "gameover";
      audio.play("error");
    }
  }

  function lockPiece(state, audio) {
    mergePiece(state);
    clearLines(state);

    if (state.lines >= state.targetLines) {
      state.phase = "win";
      audio.play("success");
      return;
    }

    spawnNext(state, audio);
    if (state.phase !== "gameover") {
      audio.play("break");
    }
  }

  function stepDown(state, audio) {
    const next = {
      matrix: state.current.matrix,
      x: state.current.x,
      y: state.current.y + 1,
    };

    if (canPlace(state.board, next)) {
      state.current.y += 1;
      return true;
    }

    lockPiece(state, audio);
    return false;
  }

  root.registerGame({
    id: "block-stack",
    title: "Block Stack",
    menuTitle: "Block Stack",
    tagline: "Puzzle blocks",
    description: "A lightweight falling-block challenge tuned for quick rounds and a clear finish line.",
    instructions: [
      "Stack falling pieces and clear full rows.",
      "Arrow up or Enter rotates. Space hard-drops instantly.",
      "Clear 12 rows before the stack reaches the top.",
    ],
    controls: [
      "Left / Right: move piece",
      "Up / Enter: rotate",
      "Down: soft drop",
      "Space: hard drop",
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

      if (state.phase === "win" || state.phase === "gameover") {
        if (action === "primary" || action === "secondary") {
          const next = createState();
          Object.assign(state, next);
          state.phase = "playing";
          audio.play("launch");
        }
        return;
      }

      if (state.phase !== "playing") {
        return;
      }

      if (action === "left") {
        const next = { matrix: state.current.matrix, x: state.current.x - 1, y: state.current.y };
        if (canPlace(state.board, next)) {
          state.current.x -= 1;
          audio.play("move");
        }
        return;
      }

      if (action === "right") {
        const next = { matrix: state.current.matrix, x: state.current.x + 1, y: state.current.y };
        if (canPlace(state.board, next)) {
          state.current.x += 1;
          audio.play("move");
        }
        return;
      }

      if (action === "down") {
        stepDown(state, audio);
        state.dropTimer = 0;
        return;
      }

      if (action === "up" || action === "primary") {
        const rotated = rotateMatrix(state.current.matrix);
        const kicks = [0, -1, 1, -2, 2];

        for (let index = 0; index < kicks.length; index += 1) {
          const candidate = {
            matrix: rotated,
            x: state.current.x + kicks[index],
            y: state.current.y,
          };

          if (canPlace(state.board, candidate)) {
            state.current.matrix = rotated;
            state.current.x = candidate.x;
            audio.play("move");
            break;
          }
        }
        return;
      }

      if (action === "secondary") {
        while (stepDown(state, audio) && state.phase === "playing") {
          state.score += 2;
        }
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing") {
        return;
      }

      state.dropTimer += dt;
      const threshold = input.held.down ? Math.max(0.05, state.dropInterval / 6) : state.dropInterval;
      if (state.dropTimer >= threshold) {
        state.dropTimer = 0;
        stepDown(state, audio);
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Block Stack", `${state.lines}/${state.targetLines} rows`);

      const cell = 10;
      const boardX = 56;
      const boardY = 28;

      ctx.fillStyle = "rgba(32, 48, 31, 0.12)";
      ctx.fillRect(boardX, boardY, 100, 200);
      ctx.strokeStyle = "rgba(32, 48, 31, 0.62)";
      ctx.strokeRect(boardX, boardY, 100, 200);

      state.board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            ctx.fillStyle = "#20301f";
            ctx.fillRect(boardX + x * cell + 1, boardY + y * cell + 1, cell - 2, cell - 2);
          } else {
            ctx.fillStyle = "rgba(32, 48, 31, 0.06)";
            ctx.fillRect(boardX + x * cell + 1, boardY + y * cell + 1, cell - 2, cell - 2);
          }
        });
      });

      state.current.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value && state.phase !== "ready") {
            ctx.fillStyle = "#445f36";
            ctx.fillRect(boardX + (state.current.x + x) * cell + 1, boardY + (state.current.y + y) * cell + 1, cell - 2, cell - 2);
          }
        });
      });

      utils.drawPanel(ctx, 182, 48, 104, 74, "Next");
      state.next.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            ctx.fillStyle = "#20301f";
            ctx.fillRect(204 + x * cell, 72 + y * cell, cell - 2, cell - 2);
          }
        });
      });

      ctx.fillStyle = "#20301f";
      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText(`Score ${state.score}`, 182, 142);
      ctx.fillText(`Speed ${Math.round((0.75 - state.dropInterval) * 100)}`, 182, 158);
      ctx.fillText("Up rotate", 182, 188);
      ctx.fillText("Space drop", 182, 204);

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Stack Start",
          lines: ["Clear 12 rows.", "Keep the pile under control.", "Press Enter"],
          footer: "Space hard drops",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Pile Up",
          lines: [`Rows ${state.lines}`, "Press Enter to retry"],
          footer: "Esc returns",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Rows Cleared",
          lines: [`Score ${state.score}`, "The stack stayed clean."],
          footer: "Enter runs again",
        });
      }
    },
  });
})();
