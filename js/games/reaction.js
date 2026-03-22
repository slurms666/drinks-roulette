(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;

  function createState() {
    return {
      phase: "ready",
      stage: "waiting",
      waitTime: 0,
      promptAt: 0,
      round: 0,
      totalRounds: 5,
      results: [],
      message: "Hold steady.",
      stageTimer: 0,
    };
  }

  function queueRound(state) {
    state.stage = "waiting";
    state.waitTime = 1.1 + Math.random() * 1.8;
    state.message = "Wait for GO";
  }

  function evaluateRun(state) {
    const average = state.results.reduce((sum, value) => sum + value, 0) / state.results.length;
    if (average <= 340) {
      state.phase = "win";
      state.message = `Average ${Math.round(average)} ms`;
    } else {
      state.phase = "gameover";
      state.message = `Average ${Math.round(average)} ms`;
    }
  }

  root.registerGame({
    id: "quick-tap",
    title: "Quick Tap",
    menuTitle: "Quick Tap",
    tagline: "Reaction test",
    description: "A simple reflex challenge: wait for the cue, react fast, and avoid jumping the gun.",
    instructions: [
      "Press Enter to begin the test, then wait for the GO signal.",
      "Hit Enter or Space only after the screen changes.",
      "Play five rounds. Average under 340ms to win.",
      "Pressing early ends the run immediately.",
    ],
    controls: [
      "Enter / Space: react",
      "R: restart test",
      "Escape: back out",
    ],
    createState() {
      return createState();
    },
    handleInput(state, action, input, engine, audio) {
      if (state.phase === "ready") {
        if (action === "primary" || action === "secondary") {
          state.phase = "playing";
          state.round = 1;
          state.results = [];
          queueRound(state);
          audio.play("launch");
        }
        return;
      }

      if (state.phase === "win" || state.phase === "gameover") {
        if (action === "primary" || action === "secondary") {
          const next = createState();
          Object.assign(state, next);
          state.phase = "playing";
          state.round = 1;
          queueRound(state);
          audio.play("launch");
        }
        return;
      }

      if (state.phase !== "playing" || (action !== "primary" && action !== "secondary")) {
        return;
      }

      if (state.stage === "waiting") {
        state.phase = "gameover";
        state.message = "False start.";
        audio.play("error");
        return;
      }

      if (state.stage === "go") {
        const reaction = Math.max(110, Math.round(performance.now() - state.promptAt));
        state.results.push(reaction);
        state.message = `${reaction} ms`;
        state.stage = "result";
        state.stageTimer = 0.8;
        audio.play("success");
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing") {
        return;
      }

      if (state.stage === "waiting") {
        state.waitTime -= dt;
        if (state.waitTime <= 0) {
          state.stage = "go";
          state.promptAt = performance.now();
          state.message = "GO";
          audio.play("move");
        }
      } else if (state.stage === "result") {
        state.stageTimer -= dt;
        if (state.stageTimer <= 0) {
          if (state.results.length >= state.totalRounds) {
            evaluateRun(state);
            if (state.phase === "win") {
              audio.play("success");
            } else {
              audio.play("error");
            }
          } else {
            state.round += 1;
            queueRound(state);
          }
        }
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Quick Tap", `Round ${Math.min(state.round || 1, state.totalRounds)}/${state.totalRounds}`);

      const progress = state.results.length / state.totalRounds;
      ctx.fillStyle = "rgba(32, 48, 31, 0.18)";
      ctx.fillRect(48, 70, 224, 92);
      ctx.strokeStyle = "rgba(32, 48, 31, 0.62)";
      ctx.strokeRect(48, 70, 224, 92);

      ctx.fillStyle = state.stage === "go" && state.phase === "playing" ? "#20301f" : "rgba(32, 48, 31, 0.5)";
      ctx.font = "bold 34px 'Lucida Console', monospace";
      ctx.textAlign = "center";
      ctx.fillText(state.phase === "ready" ? "READY" : state.message.toUpperCase(), 160, 122);

      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText("Beat the light, not your nerves.", 160, 150);
      ctx.textAlign = "left";

      utils.drawProgress(ctx, 48, 176, 224, progress);

      ctx.fillStyle = "#20301f";
      ctx.fillText(`Hits ${state.results.length}`, 48, 198);
      const average = state.results.length
        ? Math.round(state.results.reduce((sum, value) => sum + value, 0) / state.results.length)
        : 0;
      ctx.textAlign = "right";
      ctx.fillText(`Avg ${average || "--"} ms`, 272, 198);
      ctx.textAlign = "left";

      if (state.results.length) {
        ctx.font = "10px 'Lucida Console', monospace";
        const list = state.results.map((value) => `${value}ms`);
        ctx.fillText(list.join("  "), 48, 220);
      }

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Test Start",
          lines: ["Wait for GO.", "Press too soon and you lose.", "Press Enter"],
          footer: "5 reaction rounds",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Sharp",
          lines: [state.message, "Your reflexes stayed under the line."],
          footer: "Enter runs again",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Too Slow",
          lines: [state.message, "Press Enter to retry"],
          footer: "Esc returns",
        });
      }
    },
  });
})();
