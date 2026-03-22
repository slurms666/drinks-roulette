(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;
  const padTones = [320, 380, 440, 520];

  function createState() {
    return {
      phase: "ready",
      selected: 0,
      sequence: [],
      target: 8,
      mode: "idle",
      showIndex: 0,
      showTimer: 0,
      flashIndex: -1,
      flashHold: 0,
      inputIndex: 0,
      message: "Watch the pads.",
    };
  }

  function padPosition(index) {
    const col = index % 2;
    const row = Math.floor(index / 2);
    return { x: 78 + col * 88, y: 54 + row * 68, w: 68, h: 52 };
  }

  function playPad(audio, index) {
    audio.tone(padTones[index], 0.12, {
      wave: "square",
      volume: 0.04,
    });
  }

  function beginSequence(state) {
    state.sequence.push(utils.randInt(0, 3));
    state.mode = "show";
    state.showIndex = 0;
    state.showTimer = 0.52;
    state.flashIndex = state.sequence[0];
    state.flashHold = 0.52;
    state.inputIndex = 0;
    state.message = "Watch";
  }

  root.registerGame({
    id: "tone-tap",
    title: "Tone Tap",
    menuTitle: "Tone Tap",
    tagline: "Pattern repeat",
    description: "A four-pad memory game that plays a sequence for you to repeat back with the cursor.",
    instructions: [
      "Watch the flashing sequence, then repeat it one pad at a time.",
      "Use the arrows to move the cursor over a pad, then Enter or Space to confirm.",
      "Repeat eight rounds in a row to win.",
    ],
    controls: [
      "Arrows: move cursor",
      "Enter / Space: confirm selected pad",
      "R: restart round",
      "Escape: leave game",
    ],
    createState() {
      return createState();
    },
    handleInput(state, action, input, engine, audio) {
      if (state.phase === "ready") {
        if (action === "primary" || action === "secondary") {
          state.phase = "playing";
          state.sequence = [];
          beginSequence(state);
          playPad(audio, state.flashIndex);
          audio.play("launch");
        }
        return;
      }

      if (state.phase === "win" || state.phase === "gameover") {
        if (action === "primary" || action === "secondary") {
          const next = createState();
          Object.assign(state, next);
          state.phase = "playing";
          beginSequence(state);
          playPad(audio, state.flashIndex);
          audio.play("launch");
        }
        return;
      }

      if (state.mode !== "input") {
        return;
      }

      if (action === "left" && state.selected % 2 === 1) {
        state.selected -= 1;
        audio.play("move");
        return;
      }

      if (action === "right" && state.selected % 2 === 0) {
        state.selected += 1;
        audio.play("move");
        return;
      }

      if (action === "up" && state.selected >= 2) {
        state.selected -= 2;
        audio.play("move");
        return;
      }

      if (action === "down" && state.selected <= 1) {
        state.selected += 2;
        audio.play("move");
        return;
      }

      if (action === "primary" || action === "secondary") {
        const expected = state.sequence[state.inputIndex];
        playPad(audio, state.selected);
        state.flashIndex = state.selected;
        state.flashHold = 0.22;

        if (state.selected !== expected) {
          state.phase = "gameover";
          state.message = "Wrong pad.";
          audio.play("error");
          return;
        }

        state.inputIndex += 1;
        if (state.inputIndex >= state.sequence.length) {
          if (state.sequence.length >= state.target) {
            state.phase = "win";
            state.message = `Rounds ${state.sequence.length}/${state.target}`;
            audio.play("success");
          } else {
            state.mode = "pause";
            state.showTimer = 0.7;
            state.message = "Good";
            audio.play("success");
          }
        }
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing") {
        state.flashHold = Math.max(0, state.flashHold - dt);
        if (state.flashHold <= 0 && state.mode !== "show") {
          state.flashIndex = -1;
        }
        return;
      }

      if (state.mode === "show") {
        state.showTimer -= dt;
        state.flashHold = Math.max(0, state.flashHold - dt);

        if (state.showTimer <= 0) {
          if (state.flashIndex === -1) {
            state.showIndex += 1;
            if (state.showIndex >= state.sequence.length) {
              state.mode = "input";
              state.message = "Repeat";
              state.inputIndex = 0;
            } else {
              state.flashIndex = state.sequence[state.showIndex];
              state.flashHold = 0.52;
              state.showTimer = 0.52;
              playPad(audio, state.flashIndex);
            }
          } else {
            state.flashIndex = -1;
            state.showTimer = 0.2;
          }
        }
      } else if (state.mode === "pause") {
        state.showTimer -= dt;
        if (state.showTimer <= 0) {
          beginSequence(state);
          playPad(audio, state.flashIndex);
        }
      } else if (state.flashHold > 0) {
        state.flashHold -= dt;
        if (state.flashHold <= 0) {
          state.flashIndex = -1;
        }
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Tone Tap", `${state.sequence.length}/${state.target}`);

      for (let index = 0; index < 4; index += 1) {
        const pad = padPosition(index);
        const active = state.flashIndex === index;
        const selected = state.selected === index && state.mode === "input";

        ctx.fillStyle = active ? "#20301f" : "rgba(32, 48, 31, 0.18)";
        ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
        ctx.strokeStyle = selected ? "#20301f" : "rgba(32, 48, 31, 0.56)";
        ctx.lineWidth = selected ? 2 : 1;
        ctx.strokeRect(pad.x, pad.y, pad.w, pad.h);
        ctx.lineWidth = 1;

        ctx.fillStyle = active ? "#c9e79a" : "#20301f";
        ctx.font = "bold 18px 'Lucida Console', monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(index + 1), pad.x + pad.w / 2, pad.y + 31);
      }

      ctx.fillStyle = "#20301f";
      ctx.font = "10px 'Lucida Console', monospace";
      ctx.textAlign = "left";
      ctx.fillText(state.message, 18, 218);
      ctx.textAlign = "right";
      ctx.fillText("Enter confirm", 302, 218);
      ctx.textAlign = "left";

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Pattern Start",
          lines: ["Watch the pads.", "Repeat with the cursor.", "Press Enter"],
          footer: "8 rounds to win",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Sequence Lost",
          lines: [state.message, `Rounds ${state.sequence.length}/${state.target}`],
          footer: "Enter retries",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Perfect Recall",
          lines: [`Rounds ${state.sequence.length}/${state.target}`, "Sequence complete."],
          footer: "Enter plays again",
        });
      }
    },
  });
})();
