(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;

  function createState() {
    return {
      phase: "ready",
      pits: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
      selectedPit: 0,
      turn: "player",
      message: "Pick a pit",
      aiDelay: 0.9,
      result: "",
    };
  }

  function isPlayerPit(index) {
    return index >= 0 && index <= 5;
  }

  function isAiPit(index) {
    return index >= 7 && index <= 12;
  }

  function oppositePit(index) {
    return 12 - index;
  }

  function availablePlayerPits(state) {
    return [0, 1, 2, 3, 4, 5].filter((index) => state.pits[index] > 0);
  }

  function availableAiPits(state) {
    return [7, 8, 9, 10, 11, 12].filter((index) => state.pits[index] > 0);
  }

  function collectRemainingSeeds(state) {
    for (let index = 0; index <= 5; index += 1) {
      state.pits[6] += state.pits[index];
      state.pits[index] = 0;
    }

    for (let index = 7; index <= 12; index += 1) {
      state.pits[13] += state.pits[index];
      state.pits[index] = 0;
    }
  }

  function finishIfNeeded(state, audio) {
    const playerEmpty = availablePlayerPits(state).length === 0;
    const aiEmpty = availableAiPits(state).length === 0;

    if (!playerEmpty && !aiEmpty) {
      return false;
    }

    collectRemainingSeeds(state);

    if (state.pits[6] > state.pits[13]) {
      state.phase = "win";
      state.result = "You won the board.";
      audio.play("success");
    } else if (state.pits[6] < state.pits[13]) {
      state.phase = "gameover";
      state.result = "The rival store is larger.";
      audio.play("error");
    } else {
      state.phase = "win";
      state.result = "Drawn stores, solid play.";
      audio.play("success");
    }

    return true;
  }

  function applyMove(state, pitIndex, actor) {
    let seeds = state.pits[pitIndex];
    state.pits[pitIndex] = 0;
    let cursor = pitIndex;

    while (seeds > 0) {
      cursor = (cursor + 1) % 14;

      if (actor === "player" && cursor === 13) {
        continue;
      }
      if (actor === "ai" && cursor === 6) {
        continue;
      }

      state.pits[cursor] += 1;
      seeds -= 1;
    }

    const ownStore = actor === "player" ? 6 : 13;
    const ownPit = actor === "player" ? isPlayerPit(cursor) : isAiPit(cursor);

    if (ownPit && state.pits[cursor] === 1) {
      const opposite = oppositePit(cursor);
      if (state.pits[opposite] > 0) {
        state.pits[ownStore] += state.pits[opposite] + 1;
        state.pits[cursor] = 0;
        state.pits[opposite] = 0;
      }
    }

    return cursor === ownStore;
  }

  function chooseAiMove(state) {
    const options = availableAiPits(state);
    let bestPit = options[0];
    let bestScore = -Infinity;

    options.forEach((pit) => {
      const seeds = state.pits[pit];
      let cursor = pit;
      let remaining = seeds;
      let score = seeds;

      while (remaining > 0) {
        cursor = (cursor + 1) % 14;
        if (cursor === 6) {
          continue;
        }
        remaining -= 1;
      }

      if (cursor === 13) {
        score += 12;
      }

      if (isAiPit(cursor) && state.pits[cursor] === 0 && state.pits[oppositePit(cursor)] > 0) {
        score += state.pits[oppositePit(cursor)] + 6;
      }

      if (score > bestScore) {
        bestScore = score;
        bestPit = pit;
      }
    });

    return bestPit;
  }

  root.registerGame({
    id: "seed-pits",
    title: "Seed Pits",
    menuTitle: "Seed Pits",
    tagline: "Bantumi board",
    description: "A compact Mancala-style board game against a simple AI opponent with real capture and extra-turn rules.",
    instructions: [
      "Pick one of your six lower pits and sow its seeds counter-clockwise.",
      "Landing in your own store grants an extra turn.",
      "Landing in your empty pit captures the opposite seeds.",
      "When a side empties, remaining seeds move to the stores and the larger store wins.",
    ],
    controls: [
      "Left / Right: choose your pit",
      "Enter: sow the highlighted pit",
      "Escape: back to menu",
      "R: restart match",
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

      if (state.phase !== "playing" || state.turn !== "player") {
        return;
      }

      if (action === "left" || action === "up") {
        state.selectedPit = utils.wrap(state.selectedPit - 1, 0, 5);
        audio.play("move");
        return;
      }

      if (action === "right" || action === "down") {
        state.selectedPit = utils.wrap(state.selectedPit + 1, 0, 5);
        audio.play("move");
        return;
      }

      if (action === "primary" || action === "secondary") {
        if (state.pits[state.selectedPit] === 0) {
          state.message = "Empty pit.";
          audio.play("error");
          return;
        }

        const extraTurn = applyMove(state, state.selectedPit, "player");
        state.message = extraTurn ? "Extra turn." : "Rival thinking...";
        audio.play("select");

        if (finishIfNeeded(state, audio)) {
          return;
        }

        state.turn = extraTurn ? "player" : "ai";
        state.aiDelay = 0.8;
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing" || state.turn !== "ai") {
        return;
      }

      state.aiDelay -= dt;
      if (state.aiDelay > 0) {
        return;
      }

      const pit = chooseAiMove(state);
      const extraTurn = applyMove(state, pit, "ai");
      state.message = extraTurn ? "Rival kept turn." : "Your move.";
      audio.play("move");

      if (finishIfNeeded(state, audio)) {
        return;
      }

      state.turn = extraTurn ? "ai" : "player";
      state.aiDelay = 0.8;
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Seed Pits", `You ${state.pits[6]} / ${state.pits[13]} Rival`);

      const pitW = 34;
      const pitH = 34;
      const topY = 54;
      const bottomY = 152;
      const startX = 52;

      utils.drawPanel(ctx, 18, 44, 32, 130, "");
      utils.drawPanel(ctx, 270, 44, 32, 130, "");

      ctx.fillStyle = "#20301f";
      ctx.font = "bold 14px 'Lucida Console', monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(state.pits[13]), 286, 118);
      ctx.fillText(String(state.pits[6]), 34, 118);

      for (let index = 0; index < 6; index += 1) {
        const topIndex = 12 - index;
        const x = startX + index * 36;

        ctx.fillStyle = "rgba(35, 55, 33, 0.12)";
        ctx.fillRect(x, topY, pitW, pitH);
        ctx.fillRect(x, bottomY, pitW, pitH);
        ctx.strokeStyle = "rgba(32, 48, 31, 0.58)";
        ctx.strokeRect(x, topY, pitW, pitH);
        ctx.strokeRect(x, bottomY, pitW, pitH);

        if (state.turn === "player" && index === state.selectedPit && state.phase === "playing") {
          ctx.strokeStyle = "#20301f";
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 2, bottomY - 2, pitW + 4, pitH + 4);
          ctx.lineWidth = 1;
        }

        ctx.fillStyle = "#20301f";
        ctx.font = "bold 14px 'Lucida Console', monospace";
        ctx.fillText(String(state.pits[topIndex]), x + pitW / 2, topY + 22);
        ctx.fillText(String(state.pits[index]), x + pitW / 2, bottomY + 22);
      }

      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText("Rival", 286, 38);
      ctx.fillText("You", 34, 38);
      ctx.fillText(state.turn === "player" ? "Your turn" : "AI turn", 160, 206);
      ctx.fillText(state.message, 160, 222);
      ctx.textAlign = "left";

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Match Start",
          lines: ["Sow seeds into your store.", "Capture opposite pits.", "Press Enter"],
          footer: "Beat the rival store",
        });
      } else if (state.phase === "win" || state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: state.phase === "win" ? "Board Closed" : "Match Lost",
          lines: [state.result, `Stores ${state.pits[6]}-${state.pits[13]}`],
          footer: "Enter plays again",
        });
      }
    },
  });
})();
