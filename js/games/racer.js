(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;
  const lanes = [94, 132, 170, 208];

  function createState() {
    return {
      phase: "ready",
      playerLane: 1,
      cars: [],
      spawnTimer: 0,
      distance: 0,
      target: 1300,
      lives: 3,
      roadOffset: 0,
      invuln: 0,
    };
  }

  function spawnCar(state) {
    state.cars.push({
      lane: utils.randInt(0, lanes.length - 1),
      y: -42,
      w: 20,
      h: 34,
      speed: utils.randInt(110, 160),
    });
  }

  root.registerGame({
    id: "road-dodge",
    title: "Road Dodge",
    menuTitle: "Road Dodge",
    tagline: "Car dodger",
    description: "A fast lane-change racer where the goal is survival, not overtaking traffic.",
    instructions: [
      "Slide between the four lanes and avoid incoming traffic.",
      "Holding Up boosts the distance meter a little faster.",
      "Reach 1300 metres before your three lives run out.",
    ],
    controls: [
      "Left / Right: change lane",
      "Up: boost distance",
      "R: restart road",
      "Escape: back out",
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

      if (action === "left" && state.playerLane > 0) {
        state.playerLane -= 1;
        audio.play("move");
      } else if (action === "right" && state.playerLane < lanes.length - 1) {
        state.playerLane += 1;
        audio.play("move");
      }
    },
    update(state, dt, input, audio) {
      if (state.phase !== "playing") {
        return;
      }

      const roadSpeed = 120 + (input.held.up ? 30 : 0);
      state.distance += roadSpeed * dt;
      state.roadOffset = (state.roadOffset + roadSpeed * dt) % 40;
      state.invuln = Math.max(0, state.invuln - dt);

      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnCar(state);
        state.spawnTimer = 0.45 + Math.random() * 0.6;
      }

      const playerRect = { x: lanes[state.playerLane], y: 186, w: 20, h: 34 };
      const survivors = [];

      state.cars.forEach((car) => {
        car.y += car.speed * dt;

        if (car.y > 250) {
          return;
        }

        const carRect = { x: lanes[car.lane], y: car.y, w: car.w, h: car.h };
        if (state.invuln <= 0 && utils.rectsOverlap(playerRect, carRect)) {
          state.lives -= 1;
          state.invuln = 1.1;
          audio.play("loseLife");
          if (state.lives <= 0) {
            state.phase = "gameover";
            audio.play("error");
          }
          return;
        }

        survivors.push(car);
      });

      state.cars = survivors;

      if (state.distance >= state.target) {
        state.phase = "win";
        audio.play("success");
      }
    },
    render(ctx, state) {
      utils.drawFrame(ctx, "Road Dodge", `${Math.min(state.target, Math.floor(state.distance))}/${state.target}m`);

      ctx.fillStyle = "#445f36";
      ctx.fillRect(58, 24, 204, 208);
      ctx.fillStyle = "rgba(32, 48, 31, 0.25)";
      ctx.fillRect(70, 24, 180, 208);

      ctx.strokeStyle = "rgba(32, 48, 31, 0.58)";
      ctx.strokeRect(70, 24, 180, 208);

      for (let lane = 1; lane < lanes.length; lane += 1) {
        const laneX = 70 + lane * 45;
        for (let segment = -1; segment < 7; segment += 1) {
          const y = state.roadOffset + segment * 40;
          ctx.fillStyle = "rgba(214, 241, 169, 0.55)";
          ctx.fillRect(laneX, y, 4, 20);
        }
      }

      ctx.fillStyle = state.invuln > 0 && Math.floor(state.invuln * 10) % 2 === 0 ? "rgba(32, 48, 31, 0.3)" : "#20301f";
      ctx.fillRect(lanes[state.playerLane], 186, 20, 34);
      ctx.fillStyle = "#445f36";
      ctx.fillRect(lanes[state.playerLane] + 4, 190, 12, 8);

      state.cars.forEach((car) => {
        ctx.fillStyle = car.lane % 2 === 0 ? "#4c2d19" : "#20301f";
        ctx.fillRect(lanes[car.lane], car.y, car.w, car.h);
        ctx.fillStyle = "#c9e79a";
        ctx.fillRect(lanes[car.lane] + 4, car.y + 5, 12, 8);
      });

      ctx.fillStyle = "#20301f";
      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText(`Lives ${state.lives}`, 12, 232);
      ctx.textAlign = "right";
      ctx.fillText("Up boosts", 308, 232);
      ctx.textAlign = "left";

      if (state.phase === "ready") {
        utils.drawCenteredPanel(ctx, {
          title: "Road Start",
          lines: ["Dodge every car.", "Reach 1300m alive.", "Press Enter"],
          footer: "Left and right lanes",
        });
      } else if (state.phase === "gameover") {
        utils.drawCenteredPanel(ctx, {
          title: "Crash Out",
          lines: [`Distance ${Math.floor(state.distance)}m`, "Press Enter to retry"],
          footer: "Esc returns",
        });
      } else if (state.phase === "win") {
        utils.drawCenteredPanel(ctx, {
          title: "Checkpoint",
          lines: [`Distance ${Math.floor(state.distance)}m`, "Traffic beaten."],
          footer: "Enter drives again",
        });
      }
    },
  });
})();
