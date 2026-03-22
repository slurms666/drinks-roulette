(function () {
  const root = window.Pebbs3310 || (window.Pebbs3310 = {});

  const config = {
    width: 320,
    height: 240,
    palette: {
      screen: "#c9e79a",
      screenDark: "#84ac61",
      ink: "#20301f",
      inkSoft: "#34523a",
      accent: "#152318",
      warning: "#705d17",
      danger: "#702a24",
    },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function wrap(value, min, max) {
    if (value < min) {
      return max;
    }

    if (value > max) {
      return min;
    }

    return value;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function splitText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (let index = 0; index < words.length; index += 1) {
      const test = current ? `${current} ${words[index]}` : words[index];

      if (ctx.measureText(test).width <= maxWidth || !current) {
        current = test;
      } else {
        lines.push(current);
        current = words[index];
      }
    }

    if (current) {
      lines.push(current);
    }

    return lines;
  }

  function drawFrame(ctx, title, subtitle) {
    ctx.fillStyle = config.palette.screen;
    ctx.fillRect(0, 0, config.width, config.height);

    ctx.fillStyle = "rgba(44, 71, 43, 0.16)";
    for (let y = 0; y < config.height; y += 4) {
      ctx.fillRect(0, y, config.width, 1);
    }

    ctx.fillStyle = "rgba(44, 71, 43, 0.08)";
    for (let x = 0; x < config.width; x += 8) {
      ctx.fillRect(x, 0, 1, config.height);
    }

    ctx.strokeStyle = "rgba(32, 48, 31, 0.34)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, config.width - 16, config.height - 16);

    ctx.fillStyle = config.palette.ink;
    ctx.font = "bold 12px 'Lucida Console', monospace";
    ctx.textAlign = "left";
    ctx.fillText(title, 18, 24);

    if (subtitle) {
      ctx.textAlign = "right";
      ctx.font = "10px 'Lucida Console', monospace";
      ctx.fillText(subtitle, config.width - 18, 24);
      ctx.textAlign = "left";
    }
  }

  function drawPanel(ctx, x, y, width, height, title) {
    ctx.fillStyle = "rgba(203, 229, 153, 0.88)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(32, 48, 31, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    if (title) {
      ctx.fillStyle = config.palette.ink;
      ctx.font = "bold 11px 'Lucida Console', monospace";
      ctx.fillText(title, x + 10, y + 16);
    }
  }

  function drawLines(ctx, lines, x, startY, lineHeight) {
    ctx.fillStyle = config.palette.ink;
    ctx.font = "10px 'Lucida Console', monospace";
    let y = startY;

    lines.forEach((line) => {
      ctx.fillText(line, x, y);
      y += lineHeight;
    });
  }

  function drawCenteredPanel(ctx, options) {
    const lines = options.lines || [];
    const panelWidth = options.width || 236;
    const panelHeight = options.height || 118;
    const x = Math.round((config.width - panelWidth) / 2);
    const y = Math.round((config.height - panelHeight) / 2);
    drawPanel(ctx, x, y, panelWidth, panelHeight, options.title);

    ctx.fillStyle = config.palette.ink;
    ctx.textAlign = "center";
    ctx.font = "10px 'Lucida Console', monospace";

    let lineY = y + 36;
    lines.forEach((line) => {
      ctx.fillText(line, config.width / 2, lineY);
      lineY += 14;
    });

    if (options.footer) {
      ctx.font = "bold 10px 'Lucida Console', monospace";
      ctx.fillText(options.footer, config.width / 2, y + panelHeight - 14);
    }

    ctx.textAlign = "left";
  }

  function drawProgress(ctx, x, y, width, ratio) {
    const safeRatio = clamp(ratio, 0, 1);
    ctx.strokeStyle = "rgba(32, 48, 31, 0.7)";
    ctx.strokeRect(x, y, width, 8);
    ctx.fillStyle = config.palette.inkSoft;
    ctx.fillRect(x + 1, y + 1, Math.max(0, (width - 2) * safeRatio), 6);
  }

  function createNoiseDots(count, width, height) {
    const dots = [];
    for (let index = 0; index < count; index += 1) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 30 + 12,
      });
    }
    return dots;
  }

  root.config = config;
  root.games = [];
  root.registerGame = function registerGame(game) {
    root.games.push(game);
  };
  root.utils = {
    clamp,
    wrap,
    randInt,
    pick,
    rectsOverlap,
    splitText,
    drawFrame,
    drawPanel,
    drawLines,
    drawCenteredPanel,
    drawProgress,
    createNoiseDots,
  };
})();
