(function () {
  const WHEELS = {
    cocktails: {
      label: "Cocktails",
      description: "16 popular cocktails loaded, from Margaritas to Mai Tais.",
      items: [
        {
          name: "Margarita",
          style: "Tequila, lime, and orange liqueur.",
          note: "Bright, tart, and built for a salted rim."
        },
        {
          name: "Mojito",
          style: "White rum, mint, lime, and soda.",
          note: "Fresh, fizzy, and easy-drinking."
        },
        {
          name: "Old Fashioned",
          style: "Whiskey, bitters, sugar, and orange.",
          note: "Spirit-forward and slow-sipping."
        },
        {
          name: "Espresso Martini",
          style: "Vodka, coffee liqueur, and espresso.",
          note: "Cold, dark, and a little dramatic."
        },
        {
          name: "Negroni",
          style: "Gin, Campari, and sweet vermouth.",
          note: "Bitter, citrusy, and unmistakably bold."
        },
        {
          name: "Aperol Spritz",
          style: "Aperol, prosecco, and soda.",
          note: "Light, bubbly, and orange-led."
        },
        {
          name: "Whiskey Sour",
          style: "Whiskey, lemon, sugar, and optional egg white.",
          note: "Sharp citrus with a soft finish."
        },
        {
          name: "Cosmopolitan",
          style: "Vodka, cranberry, lime, and orange liqueur.",
          note: "Crisp, pink, and still a crowd puller."
        },
        {
          name: "Paloma",
          style: "Tequila, grapefruit, lime, and soda.",
          note: "Zippy, salty, and easy to repeat."
        },
        {
          name: "Moscow Mule",
          style: "Vodka, ginger beer, and lime.",
          note: "Spicy, cold, and copper-mug friendly."
        },
        {
          name: "Martini",
          style: "Gin or vodka with dry vermouth.",
          note: "Clean, icy, and all about the pour."
        },
        {
          name: "Manhattan",
          style: "Whiskey, sweet vermouth, and bitters.",
          note: "Rich, smooth, and quietly serious."
        },
        {
          name: "Daiquiri",
          style: "Rum, lime, and simple syrup.",
          note: "Simple on paper, exacting in the glass."
        },
        {
          name: "Pina Colada",
          style: "Rum, pineapple, and coconut cream.",
          note: "Creamy, tropical, and unapologetically fun."
        },
        {
          name: "Bloody Mary",
          style: "Vodka, tomato, spice, citrus, and seasoning.",
          note: "Savory, peppery, and brunch-proof."
        },
        {
          name: "Mai Tai",
          style: "Rum, lime, orange curacao, and orgeat.",
          note: "Nutty, citrusy, and tiki-bar ready."
        }
      ],
      colors: [
        "#f26c4f",
        "#f4a261",
        "#2a9d8f",
        "#457b9d",
        "#7a3e65",
        "#ff7f51",
        "#c85c5c",
        "#f2cc8f",
        "#3d405b",
        "#4d908e",
        "#9d4edd",
        "#577590",
        "#f28482",
        "#43aa8b",
        "#bc4749",
        "#f8961e"
      ]
    },
    shots: {
      label: "Shots",
      description: "8 popular shots loaded for a quicker spin.",
      items: [
        {
          name: "Tequila Shot",
          style: "Straight tequila with salt and lime on the side.",
          note: "The simple classic that never leaves the party."
        },
        {
          name: "Lemon Drop Shot",
          style: "Vodka, lemon, and sugar.",
          note: "Sweet up front, sharp on the finish."
        },
        {
          name: "Green Tea Shot",
          style: "Whiskey, peach schnapps, sour mix, and lemon-lime soda.",
          note: "Actually not tea, but reliably popular."
        },
        {
          name: "Kamikaze",
          style: "Vodka, lime, and orange liqueur.",
          note: "Cold, citrusy, and very direct."
        },
        {
          name: "B-52",
          style: "Coffee liqueur, Irish cream, and orange liqueur.",
          note: "Layered, sweet, and dessert-leaning."
        },
        {
          name: "Baby Guinness",
          style: "Coffee liqueur with Irish cream floated on top.",
          note: "Looks like a tiny stout, drinks like candy."
        },
        {
          name: "Fireball Shot",
          style: "Cinnamon whisky served ice cold.",
          note: "Hot-spice flavor with an easy finish."
        },
        {
          name: "Jager Bomb",
          style: "Jagermeister dropped into an energy drink.",
          note: "Fast, loud, and made for late nights."
        }
      ],
      colors: ["#59b7ff", "#7d5fff", "#ff8a5b", "#ef476f", "#f9c74f", "#43aa8b", "#577590", "#90be6d"]
    }
  };

  const SPIN_DURATION_MS = 4800;
  const canvas = document.getElementById("roulette-wheel");
  const wheelDisc = document.getElementById("wheel-disc");
  const wheelSelect = document.getElementById("wheel-select");
  const spinButton = document.getElementById("spin-button");
  const wheelDescription = document.getElementById("wheel-description");
  const resultName = document.getElementById("result-name");
  const resultStyle = document.getElementById("result-style");
  const resultNote = document.getElementById("result-note");
  const resultBadge = document.getElementById("result-badge");
  const resultCount = document.getElementById("result-count");
  const lineupLabel = document.getElementById("lineup-label");
  const drinkList = document.getElementById("drink-list");

  if (!canvas || !wheelDisc || !wheelSelect || !spinButton || !wheelDescription || !resultName || !resultStyle || !resultNote || !resultBadge || !resultCount || !lineupLabel || !drinkList) {
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const state = {
    category: wheelSelect.value,
    rotation: 0,
    winnerIndex: null,
    spinning: false,
    spinTimeoutId: null
  };

  function getConfig() {
    return WHEELS[state.category];
  }

  function fitLabel(text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !current) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }

    return lines.slice(0, 2);
  }

  function drawWheel() {
    const config = getConfig();
    const count = config.items.length;
    const sliceAngle = (Math.PI * 2) / count;
    const size = canvas.width;
    const center = size / 2;
    const outerRadius = center - 18;
    const innerRadius = size * 0.18;
    const labelRadius = outerRadius * 0.68;
    const fontSize = count > 12 ? 26 : 34;
    const lineHeight = fontSize * 0.9;
    const labelWidth = count > 12 ? 112 : 140;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.font = `700 ${fontSize}px "Trebuchet MS", "Gill Sans", sans-serif`;

    for (let index = 0; index < count; index += 1) {
      const item = config.items[index];
      const startAngle = -Math.PI / 2 - sliceAngle / 2 + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const labelAngle = startAngle + sliceAngle / 2;
      const fill = config.colors[index % config.colors.length];
      const x = Math.cos(labelAngle) * labelRadius;
      const y = Math.sin(labelAngle) * labelRadius;
      const lines = fitLabel(item.name, labelWidth);
      const totalHeight = (lines.length - 1) * lineHeight;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(15, 10, 15, 0.34)";
      ctx.stroke();

      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#fff7ee";
      ctx.shadowColor = "rgba(16, 9, 14, 0.38)";
      ctx.shadowBlur = 10;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, 0, lineIndex * lineHeight - totalHeight / 2);
      });

      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, outerRadius + 2, 0, Math.PI * 2);
    ctx.lineWidth = 12;
    ctx.strokeStyle = "rgba(12, 8, 10, 0.62)";
    ctx.stroke();

    const centerFill = ctx.createRadialGradient(0, 0, innerRadius * 0.18, 0, 0, innerRadius * 1.2);
    centerFill.addColorStop(0, "#fffbf3");
    centerFill.addColorStop(1, "#deb690");

    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerFill;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(14, 10, 12, 0.28)";
    ctx.stroke();

    ctx.fillStyle = "#2a161c";
    ctx.font = '700 30px "Trebuchet MS", "Gill Sans", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(config.label.toUpperCase(), 0, -10);
    ctx.font = '400 24px Georgia, "Times New Roman", serif';
    ctx.fillText(`${count} drinks`, 0, 26);

    ctx.restore();
  }

  function renderList() {
    const config = getConfig();
    drinkList.innerHTML = "";
    lineupLabel.textContent = `${config.label} list`;

    config.items.forEach((item, index) => {
      const listItem = document.createElement("li");
      const row = document.createElement("div");
      const title = document.createElement("strong");
      const number = document.createElement("span");
      const style = document.createElement("p");
      const note = document.createElement("small");

      listItem.className = "drink-item";
      if (state.winnerIndex === index) {
        listItem.classList.add("is-winner");
      }

      row.className = "drink-row";
      title.textContent = item.name;
      number.textContent = String(index + 1).padStart(2, "0");
      style.textContent = item.style;
      note.textContent = item.note;

      row.appendChild(title);
      row.appendChild(number);
      listItem.appendChild(row);
      listItem.appendChild(style);
      listItem.appendChild(note);
      drinkList.appendChild(listItem);
    });
  }

  function renderResultPanel() {
    const config = getConfig();
    const winner = state.winnerIndex === null ? null : config.items[state.winnerIndex];

    resultBadge.textContent = config.label;
    wheelDescription.textContent = config.description;

    if (state.spinning) {
      resultName.textContent = "Spinning...";
      resultStyle.textContent = `${config.label} wheel is in motion.`;
      resultNote.textContent = "Hold the pointer and let the stop decide the pour.";
      resultCount.textContent = `${config.items.length} drinks`;
      return;
    }

    if (!winner) {
      resultName.textContent = "Ready to spin";
      resultStyle.textContent = `${config.label} wheel is loaded with ${config.items.length} popular picks.`;
      resultNote.textContent = "Pick a wheel from the dropdown, then hit spin.";
      resultCount.textContent = `${config.items.length} drinks`;
      return;
    }

    resultName.textContent = winner.name;
    resultStyle.textContent = winner.style;
    resultNote.textContent = winner.note;
    resultCount.textContent = `Winner ${String(state.winnerIndex + 1).padStart(2, "0")} / ${config.items.length}`;
  }

  function syncControls() {
    spinButton.disabled = state.spinning;
    wheelSelect.disabled = state.spinning;
    spinButton.textContent = state.spinning ? "Spinning..." : "Spin the wheel";
  }

  function applyRotation(instant) {
    if (instant) {
      wheelDisc.style.transition = "none";
      wheelDisc.style.transform = `rotate(${state.rotation}deg)`;
      void wheelDisc.offsetWidth;
      wheelDisc.style.transition = "";
      return;
    }

    wheelDisc.style.transform = `rotate(${state.rotation}deg)`;
  }

  function renderAll() {
    document.body.dataset.wheel = state.category;
    drawWheel();
    renderList();
    renderResultPanel();
    syncControls();
  }

  function setCategory(category) {
    if (!WHEELS[category]) {
      return;
    }

    if (state.spinTimeoutId !== null) {
      window.clearTimeout(state.spinTimeoutId);
      state.spinTimeoutId = null;
    }

    state.category = category;
    state.rotation = 0;
    state.winnerIndex = null;
    state.spinning = false;
    applyRotation(true);
    renderAll();
  }

  function normaliseRotation() {
    state.rotation = ((state.rotation % 360) + 360) % 360;
    applyRotation(true);
  }

  function spinWheel() {
    if (state.spinning) {
      return;
    }

    const config = getConfig();
    const count = config.items.length;
    const winnerIndex = Math.floor(Math.random() * count);
    const sliceDegrees = 360 / count;
    const currentRotation = ((state.rotation % 360) + 360) % 360;
    const desiredRotation = (360 - winnerIndex * sliceDegrees) % 360;
    let delta = desiredRotation - currentRotation;

    if (delta < 0) {
      delta += 360;
    }

    state.spinning = true;
    state.winnerIndex = null;
    state.rotation += (5 + Math.floor(Math.random() * 3)) * 360 + delta;
    renderResultPanel();
    syncControls();
    applyRotation(false);

    state.spinTimeoutId = window.setTimeout(() => {
      state.spinning = false;
      state.winnerIndex = winnerIndex;
      normaliseRotation();
      renderList();
      renderResultPanel();
      syncControls();
      state.spinTimeoutId = null;
    }, SPIN_DURATION_MS);
  }

  wheelSelect.addEventListener("change", (event) => {
    setCategory(event.target.value);
  });

  spinButton.addEventListener("click", spinWheel);

  applyRotation(true);
  renderAll();
})();
