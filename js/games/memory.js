(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;
  const symbols = ["+", "O", "#", "~", "X", "=", "@", "%"];

  function shuffledCards() {
    const deck = symbols.concat(symbols).map((symbol, index) => ({
      id: index,
      symbol,
      revealed: false,
      matched: false,
    }));

    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swapIndex = utils.randInt(0, index);
      const temp = deck[index];
      deck[index] = deck[swapIndex];
      deck[swapIndex] = temp;
    }

    return deck;
  }

  function createState() {
    return {
      phase: "ready",
      cards: shuffledCards(),
      cursor: 0,
      revealedIndices: [],
      hideTimer: 0,
      missCount: 0,
      timeLeft: 50,
    };
  }

  function moveCursor(state, dx, dy) {
    const col = state.cursor % 4;
    const row = Math.floor(state.cursor / 4);
    const nextCol = utils.clamp(col + dx, 0, 3);
    const nextRow = utils.clamp(row + dy, 0, 3);
    state.cursor = nextRow * 4 + nextCol;
  }

  root.registerGame({
    id: "memory-match",
    title: "Memory Match",
    menuTitle: "Memory Match",
    tagline: "Flip pairs",
    description: "Flip the hidden cards, remember the symbols, and clear the whole board before the LCD timer drains away.",
    instructions: [
      "Reveal two cards at a time and match the symbol pairs.",
      "If the pair misses, the cards flip back after a short pause.",
      "Clear all eight pairs before the 50-second timer hits zero.",
    ],
    controls: [
      "Arrows: move cursor",
      "Enter: flip card",
      "Escape: leave game",
      "R: restart board",
    ],
    createState() {
      return createState();
    },
    handleInput(state, action, input, engine, audio) {
      if (state.phase === "ready") {
        if (action === "primary") {
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

      if (state.phase !== "playing" || state.hideTimer > 0) {
        return;
      }

      if (action === "left") {
        moveCursor(state, -1, 0);
        audio.play("move");
        return;
      }
      if (action === "right") {
        moveCursor(state, 1, 0);
        audio.play("move");
        return;
      }
      if (action === "up") {
        moveCursor(state, 0, -1);
        audio.play("move");
        return;
      }
      if (action === "down") {
        moveCursor(state, 0, 1);
        audio.play("move");
        return;
      }

      if (action === "primary" || action === "secondary") {
        const card = state.cards[state.cursor];
        if (card.matched || card.revealed) {
          return;
        }

        card.revealed = true;
        state.revealedIndices.push(state.cursor);
        audio.play("select");

        if (state.revealedIndices.length === 2) {
          const [firstIndex, secondIndex] = state.revealedIndices;
          const first = state.cards[firstIndex];
          const second = state.cards[secondIndex];

          if (first.symbol === second.symbol) {
            first.matched = true;
            second.matched = true;
            state.revealedIndices = [];
            audio.play("success");
          } else {
            state.hideTimer = 0.7;
            state.missCount += 1;
            audio.play("error");
          }
        }
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing") {
        return;
      }

      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.phase = "gameover";
        audio.play("error");
        return;
      }

      if (state.hideTimer > 0) {
        state.hideTimer -= dt;
        if (state.hideTimer <= 0) {
          state.revealedIndices.forEach((index) => {
            state.cards[index].revealed = false;
          });
          state.revealedIndices = [];
        }
      }

      const matched = state.cards.filter((card) => card.matched).length;
      if (matched === state.cards.length) {
        state.phase = "win";
        audio.play("success");
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Memory Match", `${Math.ceil(state.timeLeft)}s`);

      const cardW = 54;
      const cardH = 38;
      const startX = 40;
      const startY = 42;

      state.cards.forEach((card, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = startX + col * 60;
        const y = startY + row * 44;
        const active = state.cursor === index && state.phase === "playing";

        ctx.fillStyle = card.revealed || card.matched ? "rgba(214, 241, 169, 0.88)" : "rgba(32, 48, 31, 0.18)";
        ctx.fillRect(x, y, cardW, cardH);
        ctx.strokeStyle = active ? "#20301f" : "rgba(32, 48, 31, 0.6)";
        ctx.lineWidth = active ? 2 : 1;
        ctx.strokeRect(x, y, cardW, cardH);
        ctx.lineWidth = 1;

        if (card.revealed || card.matched) {
          ctx.fillStyle = "#20301f";
          ctx.font = "bold 22px 'Lucida Console', monospace";
          ctx.textAlign = "center";
          ctx.fillText(card.symbol, x + cardW / 2, y + 25);
        } else {
          ctx.fillStyle = "#20301f";
          ctx.fillRect(x + 20, y + 10, 14, 18);
        }
      });

      ctx.fillStyle = "#20301f";
      ctx.font = "10px 'Lucida Console', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`Misses ${state.missCount}`, 18, 230);
      ctx.textAlign = "right";
      ctx.fillText(`${state.cards.filter((card) => card.matched).length / 2}/8 pairs`, 302, 230);

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Ready",
          lines: ["Flip two cards.", "Remember the symbols.", "Press Enter"],
          footer: "Clear 8 pairs",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Time Up",
          lines: [`Pairs ${state.cards.filter((card) => card.matched).length / 2}/8`, "Press Enter to replay"],
          footer: "Esc returns",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Matched",
          lines: [`Misses ${state.missCount}`, "Full board cleared."],
          footer: "Enter starts again",
        });
      }
    },
  });
})();
