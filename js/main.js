(function () {
  function parseLibrary(data, fallbackStyle, fallbackNote) {
    return data
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|");
        return {
          id: parts[0],
          name: parts[1],
          style: parts[2] || fallbackStyle,
          note: parts[3] || fallbackNote
        };
      });
  }

  const COCKTAIL_LIBRARY = parseLibrary(
    `
    negroni|Negroni|Gin, Campari, and sweet vermouth.|Bitter, citrusy, and still the current No. 1 global classic.
    old-fashioned|Old Fashioned|Whiskey, bitters, sugar, and orange.|Spirit-forward and slow-sipping.
    margarita|Margarita|Tequila, lime, and orange liqueur.|Bright, tart, and built for a salted rim.
    espresso-martini|Espresso Martini|Vodka, coffee liqueur, and espresso.|Cold, dark, and a little dramatic.
    daiquiri|Daiquiri|Rum, lime, and simple syrup.|Simple on paper, exacting in the glass.
    whiskey-sour|Whiskey Sour|Whiskey, lemon, sugar, and optional egg white.|Sharp citrus with a soft finish.
    dry-martini|Dry Martini|Gin and dry vermouth, usually with a twist or olive.|Clean, icy, and quietly serious.
    aperol-spritz|Aperol Spritz|Aperol, prosecco, and soda.|Light, bubbly, and orange-led.
    paloma|Paloma|Tequila, grapefruit, lime, and soda.|Zippy, salty, and easy to repeat.
    manhattan|Manhattan|Whiskey, sweet vermouth, and bitters.|Rich, smooth, and bar-cart dependable.
    pornstar-martini|Pornstar Martini|Vanilla vodka, passion fruit, lime, and sparkling wine on the side.|A modern classic with serious crowd appeal.
    penicillin|Penicillin|Scotch, lemon, honey-ginger syrup, and an Islay float.|Spicy, smoky, and modern without feeling fussy.
    boulevardier|Boulevardier|Whiskey, Campari, and sweet vermouth.|A darker, warmer cousin of the Negroni.
    moscow-mule|Moscow Mule|Vodka, ginger beer, and lime.|Spicy, cold, and copper-mug friendly.
    amaretto-sour|Amaretto Sour|Amaretto, lemon, sugar, and often bourbon or egg white.|Sweet, sharp, and unexpectedly polished.
    mojito|Mojito|White rum, mint, lime, and soda.|Fresh, fizzy, and easy-drinking.
    gimlet|Gimlet|Gin, lime, and sugar.
    french-75|French 75|Gin, lemon, sugar, and Champagne.
    bloody-mary|Bloody Mary|Vodka, tomato, spice, citrus, and seasoning.
    americano|Americano|Campari, sweet vermouth, and soda.
    vodka-martini|Vodka Martini|Vodka and dry vermouth.
    gin-fizz|Gin Fizz|Gin, lemon, sugar, and soda.
    zombie|Zombie|Multiple rums, citrus, falernum, and tropical spice.
    pisco-sour|Pisco Sour|Pisco, lime, sugar, bitters, and egg white.
    cosmopolitan|Cosmopolitan|Vodka, cranberry, lime, and orange liqueur.
    aviation|Aviation|Gin, maraschino, lemon, and creme de violette.
    naked-and-famous|Naked & Famous|Mezcal, Aperol, yellow Chartreuse, and lime.
    mezcal-margarita|Mezcal Margarita|Mezcal, lime, and orange liqueur.
    dark-and-stormy|Dark & Stormy|Dark rum, ginger beer, and lime.
    paper-plane|Paper Plane|Bourbon, Aperol, Amaro Nonino, and lemon.
    clover-club|Clover Club|Gin, raspberry, lemon, and egg white.
    caipirinha|Caipirinha|Cachaca, lime, and sugar.
    bees-knees|Bee's Knees|Gin, honey, and lemon.
    oaxaca-old-fashioned|Oaxaca Old Fashioned|Tequila, mezcal, agave, and bitters.
    bramble|Bramble|Gin, lemon, sugar, and blackberry liqueur.
    last-word|Last Word|Gin, green Chartreuse, maraschino, and lime.
    sazerac|Sazerac|Rye or cognac, sugar, bitters, and absinthe rinse.
    mai-tai|Mai Tai|Rum, lime, orange curacao, and orgeat.
    old-cuban|Old Cuban|Aged rum, mint, lime, bitters, sugar, and sparkling wine.
    pina-colada|Pina Colada|Rum, pineapple, and coconut cream.
    sidecar|Sidecar|Cognac, orange liqueur, and lemon.
    gin-basil-smash|Gin Basil Smash|Gin, basil, lemon, and sugar.
    corpse-reviver-2|Corpse Reviver 2|Gin, Cointreau, Lillet Blanc, lemon, and absinthe rinse.
    fitzgerald|Fitzgerald|Gin, lemon, sugar, and bitters.
    painkiller|Painkiller|Rum, pineapple, orange, coconut cream, and nutmeg.
    ramos-gin-fizz|Ramos Gin Fizz|Gin, citrus, cream, egg white, and orange flower water.
    southside|Southside|Gin, mint, lime, and sugar.
    long-island-iced-tea|Long Island Iced Tea|Vodka, rum, gin, tequila, triple sec, citrus, and cola.
    hanky-panky|Hanky Panky|Gin, sweet vermouth, and Fernet-Branca.
    carajillo|Carajillo|Coffee and Licor 43 or another sweet liqueur.
    `,
    "Classic cocktail pulled from the larger bestselling cocktail library.",
    "Loaded from the broader cocktail pool for the current wheel."
  );

  const SHOT_LIBRARY = parseLibrary(
    `
    tequila-shot|Tequila Shot|Straight tequila with salt and lime on the side.|The simple classic that never leaves the party.
    green-tea-shot|Green Tea Shot|Whiskey, peach schnapps, sour mix, and lemon-lime soda.|A modern bar favorite that keeps turning up on current trend lists.
    lemon-drop-shot|Lemon Drop Shot|Vodka, lemon, and sugar.|Sweet up front, sharp on the finish.
    kamikaze|Kamikaze|Vodka, lime, and orange liqueur.|Cold, citrusy, and very direct.
    b-52|B-52|Coffee liqueur, Irish cream, and orange liqueur.|Layered, sweet, and dessert-leaning.
    baby-guinness|Baby Guinness|Coffee liqueur with Irish cream floated on top.|Looks like a tiny stout, drinks like candy.
    jager-bomb|Jager Bomb|Jagermeister dropped into an energy drink.|Still a loud late-night staple.
    fireball-shot|Fireball Shot|Cinnamon whisky served ice cold.|Hot-spice flavor with an easy finish.
    m-and-m-shot|M&M Shot|Mezcal and Amaro Montenegro.
    ferrari|Ferrari|Fernet and Campari.
    mexican-candy-shot|Mexican Candy Shot|Tequila, watermelon, lime, and chili heat.
    soju-bomb|Soju Bomb|Soju dropped into beer.
    white-tea-shot|White Tea Shot|Vodka, peach schnapps, citrus, and lemon-lime soda.
    pickleback|Pickleback|Whiskey chased with pickle brine.
    vegas-bomb|Vegas Bomb|Canadian whisky, peach schnapps, and an energy drink drop.
    washington-apple|Washington Apple|Whiskey, apple liqueur, and cranberry.
    buttery-nipple|Buttery Nipple|Butterscotch schnapps and Irish cream.
    mini-beer|Mini Beer|Licor 43 topped with a little cream.
    snaquiri-shot|Snaquiri Shot|A miniature Daiquiri poured as a shot.
    carajillo-shot|Carajillo Shot|Coffee liqueur and chilled coffee served as a shooter.
    tubi-shot|Tubi Shot|Herbal citrus liqueur, often with lemon.
    mezcal-shot|Mezcal Shot|Straight mezcal, often with an orange slice and chili salt.
    rumple-minze-shot|Rumple Minze Shot|Peppermint schnapps served ice cold.
    maserati|Maserati|Mezcal and Ramazzotti.
    tequila-ocho-shot|Tequila Ocho Shot|Reposado tequila served neat.
    cynar-shot|Cynar Shot|Cynar served neat or chilled.
    house-shot|House Shot|A bartender-made signature shooter.
    `,
    "Popular shot pulled from the larger house shots library.",
    "Loaded from the broader shots pool for the current wheel."
  );

  const PALETTES = {
    cocktails: [
      "#7a3e65", "#ff7f51", "#f26c4f", "#f4a261", "#2a9d8f", "#457b9d", "#9d4edd", "#577590",
      "#f28482", "#43aa8b", "#bc4749", "#f8961e", "#3d405b", "#4d908e", "#c85c5c", "#f2cc8f"
    ],
    shots: ["#59b7ff", "#7d5fff", "#ff8a5b", "#ef476f", "#f9c74f", "#43aa8b", "#577590", "#90be6d"]
  };

  const CATEGORIES = {
    cocktails: {
      label: "Cocktails",
      singular: "cocktail",
      slotCount: 16,
      shuffleLabel: "Shuffle cocktails",
      description: "Default lineup uses 16 bestselling classics from the 2025 global bar report.",
      modifiedDescription: "Custom cocktail lineup active. Shuffle, edit any slot, or reset to the ranked defaults.",
      customStyle: "Custom cocktail added to this wheel.",
      customNote: "Typed by you. It spins just like any library pick.",
      defaultIds: [
        "negroni", "old-fashioned", "margarita", "espresso-martini", "daiquiri", "whiskey-sour",
        "dry-martini", "aperol-spritz", "paloma", "manhattan", "pornstar-martini", "penicillin",
        "boulevardier", "moscow-mule", "amaretto-sour", "mojito"
      ],
      library: COCKTAIL_LIBRARY,
      palette: PALETTES.cocktails
    },
    shots: {
      label: "Shots",
      singular: "shot",
      slotCount: 8,
      shuffleLabel: "Shuffle shots",
      description: "Default lineup uses 8 crowd favorites, while shuffle pulls from a bigger shots library.",
      modifiedDescription: "Custom shot lineup active. Shuffle, edit any slot, or reset to the default 8.",
      customStyle: "Custom shot added to this wheel.",
      customNote: "Typed by you. It spins just like any library pick.",
      defaultIds: [
        "tequila-shot", "green-tea-shot", "lemon-drop-shot", "kamikaze",
        "b-52", "baby-guinness", "jager-bomb", "fireball-shot"
      ],
      library: SHOT_LIBRARY,
      palette: PALETTES.shots
    }
  };

  Object.values(CATEGORIES).forEach((config) => {
    config.libraryById = new Map(config.library.map((drink) => [drink.id, drink]));
    config.libraryByName = new Map(config.library.map((drink) => [drink.name.toLowerCase(), drink]));
  });

  function createSlot(category, drink, isCustom, customName) {
    if (isCustom) {
      return {
        sourceId: null,
        name: customName,
        style: CATEGORIES[category].customStyle,
        note: CATEGORIES[category].customNote,
        custom: true
      };
    }

    return {
      sourceId: drink.id,
      name: drink.name,
      style: drink.style,
      note: drink.note,
      custom: false
    };
  }

  function buildDefaultLineup(category) {
    return CATEGORIES[category].defaultIds.map((id) => createSlot(category, CATEGORIES[category].libraryById.get(id)));
  }

  const DEFAULT_LINEUPS = {
    cocktails: buildDefaultLineup("cocktails"),
    shots: buildDefaultLineup("shots")
  };

  const SPIN_DURATION_MS = 4800;
  const POINTER_TARGET_DEGREES = 90;
  const MAX_DEVICE_PIXEL_RATIO = 2;
  const MIN_CANVAS_SIZE = 320;
  const MAX_CANVAS_SIZE = 1200;

  const elements = {
    canvas: document.getElementById("roulette-wheel"),
    wheelDisc: document.getElementById("wheel-disc"),
    wheelSelect: document.getElementById("wheel-select"),
    spinButton: document.getElementById("spin-button"),
    shuffleButton: document.getElementById("shuffle-button"),
    editButton: document.getElementById("edit-button"),
    resetButton: document.getElementById("reset-button"),
    wheelDescription: document.getElementById("wheel-description"),
    resultName: document.getElementById("result-name"),
    resultStyle: document.getElementById("result-style"),
    resultNote: document.getElementById("result-note"),
    resultBadge: document.getElementById("result-badge"),
    resultCount: document.getElementById("result-count"),
    lineupLabel: document.getElementById("lineup-label"),
    drinkList: document.getElementById("drink-list"),
    editorDialog: document.getElementById("editor-dialog"),
    editorTitle: document.getElementById("editor-title"),
    editorCopy: document.getElementById("editor-copy"),
    editorList: document.getElementById("editor-list"),
    editorClose: document.getElementById("editor-close"),
    editorShuffle: document.getElementById("editor-shuffle"),
    editorReset: document.getElementById("editor-reset")
  };

  if (Object.values(elements).some((element) => !element)) {
    return;
  }

  const ctx = elements.canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const state = {
    category: elements.wheelSelect.value,
    rotation: 0,
    winnerIndex: null,
    spinning: false,
    spinTimeoutId: null,
    lineups: {
      cocktails: DEFAULT_LINEUPS.cocktails.map((drink) => ({ ...drink })),
      shots: DEFAULT_LINEUPS.shots.map((drink) => ({ ...drink }))
    }
  };
  let resizeFrameId = 0;

  function getConfig(category) {
    return CATEGORIES[category || state.category];
  }

  function getLineup(category) {
    return state.lineups[category || state.category];
  }

  function isLineupModified(category) {
    const current = getLineup(category);
    const baseline = DEFAULT_LINEUPS[category];

    return current.some(
      (drink, index) =>
        drink.name !== baseline[index].name || drink.sourceId !== baseline[index].sourceId
    );
  }

  function syncCanvasResolution() {
    const displaySize = Math.max(280, Math.round(elements.canvas.clientWidth || elements.wheelDisc.clientWidth || MIN_CANVAS_SIZE));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const renderSize = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, Math.round(displaySize * pixelRatio)));

    if (elements.canvas.width !== renderSize || elements.canvas.height !== renderSize) {
      elements.canvas.width = renderSize;
      elements.canvas.height = renderSize;
    }

    return { displaySize, pixelRatio, renderSize };
  }

  function requestWheelDraw() {
    if (resizeFrameId) {
      return;
    }

    resizeFrameId = window.requestAnimationFrame(() => {
      resizeFrameId = 0;
      drawWheel();
    });
  }

  function splitLongToken(token, maxWidth) {
    let best = [token];
    let bestWidth = Number.POSITIVE_INFINITY;

    for (let pivot = 2; pivot <= token.length - 2; pivot += 1) {
      const left = token.slice(0, pivot);
      const right = token.slice(pivot);
      const widest = Math.max(ctx.measureText(left).width, ctx.measureText(right).width);

      if (widest < bestWidth) {
        best = [left, right];
        bestWidth = widest;
      }
    }

    return bestWidth <= maxWidth || token.length > 4 ? best : [token];
  }

  function setWheelFont(fontSize) {
    ctx.font = `700 ${fontSize}px "Trebuchet MS", "Gill Sans", sans-serif`;
  }

  function balanceIntoTwoLines(words) {
    let best = [words.join(" ")];
    let bestWidth = Number.POSITIVE_INFINITY;

    for (let pivot = 1; pivot < words.length; pivot += 1) {
      const left = words.slice(0, pivot).join(" ");
      const right = words.slice(pivot).join(" ");
      const widest = Math.max(ctx.measureText(left).width, ctx.measureText(right).width);

      if (widest < bestWidth) {
        best = [left, right];
        bestWidth = widest;
      }
    }

    return best;
  }

  function wrapLabelLines(text, maxWidth) {
    const words = text.split(/\s+/).filter(Boolean);

    if (words.length === 1 && ctx.measureText(words[0]).width > maxWidth) {
      return splitLongToken(words[0], maxWidth);
    }

    const lines = [];
    let current = "";

    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) {
      lines.push(current);
    }

    return lines.length <= 2 ? lines : balanceIntoTwoLines(words);
  }

  function getLabelLayout(text, maxWidth, baseFontSize) {
    const minFontSize = Math.max(12, Math.round(baseFontSize * 0.72));
    const isSingleWord = text.trim().split(/\s+/).length === 1;

    for (let fontSize = baseFontSize; fontSize >= minFontSize; fontSize -= 1) {
      setWheelFont(fontSize);
      if (ctx.measureText(text).width <= maxWidth) {
        return { fontSize, lines: [text] };
      }

      if (isSingleWord) {
        continue;
      }

      const lines = wrapLabelLines(text, maxWidth);
      const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
      if (widest <= maxWidth) {
        return { fontSize, lines };
      }
    }

    setWheelFont(minFontSize);
    return {
      fontSize: minFontSize,
      lines: wrapLabelLines(text, maxWidth)
    };
  }

  function getHubTitleSize(text, maxWidth, baseFontSize, minFontSize) {
    for (let fontSize = baseFontSize; fontSize >= minFontSize; fontSize -= 1) {
      ctx.font = `700 ${fontSize}px "Trebuchet MS", "Gill Sans", sans-serif`;
      if (ctx.measureText(text).width <= maxWidth) {
        return fontSize;
      }
    }

    return minFontSize;
  }

  function drawWheel() {
    const config = getConfig();
    const lineup = getLineup();
    const count = lineup.length;
    const sliceAngle = (Math.PI * 2) / count;
    const { displaySize, pixelRatio, renderSize: size } = syncCanvasResolution();
    const center = size / 2;
    const outerRadius = center - Math.max(10, 18 * pixelRatio);
    const innerRadius = size * 0.18;
    const labelRadius = innerRadius + (outerRadius - innerRadius) * (count > 12 ? 0.61 : 0.59);
    const fontSize = Math.round((count > 12 ? Math.max(13, displaySize * 0.042) : Math.max(17, displaySize * 0.058)) * pixelRatio);
    const radialLabelWidth = outerRadius - innerRadius - Math.max(18 * pixelRatio, size * 0.03);
    const labelWidth = Math.max(44 * pixelRatio, radialLabelWidth);

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    setWheelFont(fontSize);

    lineup.forEach((drink, index) => {
      const startAngle = -Math.PI / 2 - sliceAngle / 2 + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const labelAngle = startAngle + sliceAngle / 2;
      const x = Math.cos(labelAngle) * labelRadius;
      const y = Math.sin(labelAngle) * labelRadius;
      const fittedLabel = getLabelLayout(drink.name, labelWidth, fontSize);
      const lineHeight = fittedLabel.fontSize * 0.94;
      const totalHeight = (fittedLabel.lines.length - 1) * lineHeight;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = config.palette[index % config.palette.length];
      ctx.fill();
      ctx.lineWidth = Math.max(2 * pixelRatio, size * 0.0044);
      ctx.strokeStyle = "rgba(15, 10, 15, 0.34)";
      ctx.stroke();

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(labelAngle);
      ctx.fillStyle = "#fff7ee";
      ctx.strokeStyle = "rgba(24, 12, 19, 0.28)";
      ctx.lineWidth = Math.max(1.5 * pixelRatio, fittedLabel.fontSize * 0.08);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setWheelFont(fittedLabel.fontSize);

      fittedLabel.lines.forEach((line, lineIndex) => {
        const lineY = lineIndex * lineHeight - totalHeight / 2;
        ctx.strokeText(line, 0, lineY);
        ctx.fillText(line, 0, lineY);
      });

      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, outerRadius + 2, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(7 * pixelRatio, size * 0.017);
    ctx.strokeStyle = "rgba(12, 8, 10, 0.62)";
    ctx.stroke();

    const centerFill = ctx.createRadialGradient(0, 0, innerRadius * 0.18, 0, 0, innerRadius * 1.2);
    centerFill.addColorStop(0, "#fffbf3");
    centerFill.addColorStop(1, "#deb690");

    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerFill;
    ctx.fill();
    ctx.lineWidth = Math.max(4 * pixelRatio, size * 0.011);
    ctx.strokeStyle = "rgba(14, 10, 12, 0.28)";
    ctx.stroke();

    const hubText = config.label.toUpperCase();
    const hubTitleSize = getHubTitleSize(
      hubText,
      innerRadius * 1.5,
      Math.round(Math.max(20, displaySize * 0.06) * pixelRatio),
      Math.round(Math.max(15, displaySize * 0.042) * pixelRatio)
    );
    ctx.fillStyle = "#2a161c";
    ctx.font = `700 ${hubTitleSize}px "Trebuchet MS", "Gill Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hubText, 0, 0);
    ctx.restore();
  }

  function renderList() {
    const config = getConfig();
    elements.drinkList.innerHTML = "";
    elements.lineupLabel.textContent = isLineupModified(state.category) ? `Custom ${config.singular} lineup` : `Current ${config.singular} lineup`;

    getLineup().forEach((drink, index) => {
      const item = document.createElement("li");
      item.className = "drink-item";
      if (state.winnerIndex === index) {
        item.classList.add("is-winner");
      }

      const row = document.createElement("div");
      row.className = "drink-row";
      const title = document.createElement("strong");
      title.textContent = drink.name;
      const slot = document.createElement("span");
      slot.textContent = String(index + 1).padStart(2, "0");
      row.appendChild(title);
      row.appendChild(slot);

      const style = document.createElement("p");
      style.textContent = drink.style;
      const note = document.createElement("small");
      note.textContent = drink.note;

      item.appendChild(row);
      item.appendChild(style);
      item.appendChild(note);
      elements.drinkList.appendChild(item);
    });
  }

  function renderResultPanel() {
    const config = getConfig();
    const modified = isLineupModified(state.category);
    const winner = state.winnerIndex === null ? null : getLineup()[state.winnerIndex];

    elements.resultBadge.textContent = config.label;
    elements.wheelDescription.textContent = modified ? config.modifiedDescription : config.description;

    if (state.spinning) {
      elements.resultName.textContent = "Spinning...";
      elements.resultStyle.textContent = `${config.label} wheel is in motion.`;
      elements.resultNote.textContent = "Hold the pointer and let the stop decide the pour.";
      elements.resultCount.textContent = `${config.slotCount} drinks`;
      return;
    }

    if (!winner) {
      elements.resultName.textContent = "Ready to spin";
      elements.resultStyle.textContent = modified ? `Custom ${config.singular} lineup is loaded with ${config.slotCount} slots.` : `${config.label} wheel is loaded with ${config.slotCount} popular picks.`;
      elements.resultNote.textContent = modified ? "Edit any slot, shuffle again, or reset back to the defaults." : "Shuffle from the larger library, edit any slot, or type your own drink.";
      elements.resultCount.textContent = `${config.slotCount} drinks`;
      return;
    }

    elements.resultName.textContent = winner.name;
    elements.resultStyle.textContent = winner.style;
    elements.resultNote.textContent = winner.note;
    elements.resultCount.textContent = `Winner ${String(state.winnerIndex + 1).padStart(2, "0")} / ${config.slotCount}`;
  }

  function syncControls() {
    const config = getConfig();
    const canReset = isLineupModified(state.category);
    [elements.spinButton, elements.wheelSelect, elements.shuffleButton, elements.editButton, elements.editorShuffle].forEach((control) => {
      control.disabled = state.spinning;
    });
    elements.resetButton.disabled = state.spinning || !canReset;
    elements.editorReset.disabled = state.spinning || !canReset;
    elements.spinButton.textContent = state.spinning ? "Spinning..." : "Spin the wheel";
    elements.shuffleButton.textContent = config.shuffleLabel;
    elements.editorShuffle.textContent = config.shuffleLabel;

    elements.editorDialog.querySelectorAll(".editor-select").forEach((select) => {
      select.disabled = state.spinning;
    });

    elements.editorDialog.querySelectorAll(".editor-input").forEach((input) => {
      const enabledForCustom = input.dataset.customEnabled === "true";
      input.disabled = state.spinning || !enabledForCustom;
    });
  }

  function renderEditor() {
    const config = getConfig();
    elements.editorTitle.textContent = `Edit ${config.singular} lineup`;
    elements.editorCopy.textContent = `Pick from the larger ${config.singular} library or type your own custom ${config.singular}.`;
    elements.editorList.innerHTML = "";

    getLineup().forEach((drink, index) => {
      const item = document.createElement("li");
      item.className = "editor-item";

      const head = document.createElement("div");
      head.className = "editor-item-head";
      const badge = document.createElement("span");
      badge.className = "slot-badge";
      badge.textContent = String(index + 1).padStart(2, "0");
      const status = document.createElement("strong");
      status.textContent = drink.custom ? "Custom entry" : "Library pick";
      head.appendChild(badge);
      head.appendChild(status);

      const controls = document.createElement("div");
      controls.className = "editor-controls";

      const select = document.createElement("select");
      select.className = "editor-select";
      select.setAttribute("aria-label", `Choose ${config.singular} for slot ${index + 1}`);
      select.dataset.slotIndex = String(index);
      const customOption = document.createElement("option");
      customOption.value = "__custom__";
      customOption.textContent = `Custom ${config.singular}`;
      select.appendChild(customOption);

      config.library.forEach((libraryDrink) => {
        const option = document.createElement("option");
        option.value = libraryDrink.id;
        option.textContent = libraryDrink.name;
        select.appendChild(option);
      });

      select.value = drink.custom ? "__custom__" : drink.sourceId;

      const input = document.createElement("input");
      input.className = "editor-input";
      input.type = "text";
      input.value = drink.custom ? drink.name : "";
      input.placeholder = `Type a custom ${config.singular}`;
      input.setAttribute("aria-label", `Type custom ${config.singular} for slot ${index + 1}`);
      input.dataset.slotIndex = String(index);
      input.dataset.customEnabled = drink.custom ? "true" : "false";
      input.disabled = state.spinning || !drink.custom;

      const note = document.createElement("p");
      note.className = "editor-note";
      note.textContent = drink.custom ? config.customNote : `${drink.style} Pick Custom if you want to type your own.`;

      item.appendChild(head);
      controls.appendChild(select);
      controls.appendChild(input);
      item.appendChild(controls);
      item.appendChild(note);
      elements.editorList.appendChild(item);
    });
  }

  function applyRotation(instant) {
    if (instant) {
      elements.wheelDisc.style.transition = "none";
      elements.wheelDisc.style.transform = `rotate(${state.rotation}deg)`;
      void elements.wheelDisc.offsetWidth;
      elements.wheelDisc.style.transition = "";
      return;
    }

    elements.wheelDisc.style.transform = `rotate(${state.rotation}deg)`;
  }

  function renderAll() {
    document.body.dataset.wheel = state.category;
    drawWheel();
    renderList();
    renderResultPanel();
    syncControls();
  }

  function closeEditor() {
    if (typeof elements.editorDialog.close === "function") {
      elements.editorDialog.close();
    } else {
      elements.editorDialog.removeAttribute("open");
    }
  }

  function openEditor() {
    renderEditor();
    if (typeof elements.editorDialog.showModal === "function") {
      if (!elements.editorDialog.open) {
        elements.editorDialog.showModal();
      }
    } else {
      elements.editorDialog.setAttribute("open", "open");
    }
  }

  function resolveInputToSlot(category, value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const libraryMatch = getConfig(category).libraryByName.get(trimmed.toLowerCase());
    return libraryMatch ? createSlot(category, libraryMatch) : createSlot(category, null, true, trimmed);
  }

  function handleLineupMutation() {
    state.winnerIndex = null;
    state.rotation = 0;
    applyRotation(true);
    renderAll();
    if (elements.editorDialog.open) {
      renderEditor();
    }
  }

  function updateSlot(index, value) {
    if (state.spinning) {
      return;
    }

    const resolved = resolveInputToSlot(state.category, value);
    if (!resolved) {
      renderEditor();
      return;
    }
    state.lineups[state.category][index] = resolved;
    handleLineupMutation();
  }

  function sampleWithoutRepeat(list, count) {
    const pool = list.slice();
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const current = pool[index];
      pool[index] = pool[randomIndex];
      pool[randomIndex] = current;
    }
    return pool.slice(0, count);
  }

  function shuffleCurrentLineup() {
    const config = getConfig();
    state.lineups[state.category] = sampleWithoutRepeat(config.library, config.slotCount).map((drink) => createSlot(state.category, drink));
    handleLineupMutation();
  }

  function resetCurrentLineup() {
    state.lineups[state.category] = DEFAULT_LINEUPS[state.category].map((drink) => ({ ...drink }));
    handleLineupMutation();
  }

  function setCategory(category) {
    if (!CATEGORIES[category]) {
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
    if (elements.editorDialog.open) {
      renderEditor();
    }
  }

  function normaliseRotation() {
    state.rotation = ((state.rotation % 360) + 360) % 360;
    applyRotation(true);
  }

  function spinWheel() {
    if (state.spinning) {
      return;
    }

    const count = getLineup().length;
    const winnerIndex = Math.floor(Math.random() * count);
    const sliceDegrees = 360 / count;
    const currentRotation = ((state.rotation % 360) + 360) % 360;
    const desiredRotation = (POINTER_TARGET_DEGREES - winnerIndex * sliceDegrees + 360) % 360;
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

  elements.wheelSelect.addEventListener("change", (event) => {
    setCategory(event.target.value);
  });
  elements.spinButton.addEventListener("click", spinWheel);
  elements.shuffleButton.addEventListener("click", shuffleCurrentLineup);
  elements.resetButton.addEventListener("click", resetCurrentLineup);
  elements.editButton.addEventListener("click", openEditor);
  elements.editorClose.addEventListener("click", closeEditor);
  elements.editorShuffle.addEventListener("click", shuffleCurrentLineup);
  elements.editorReset.addEventListener("click", resetCurrentLineup);

  elements.editorList.addEventListener("change", (event) => {
    const select = event.target.closest(".editor-select");

    if (select) {
      if (state.spinning) {
        return;
      }

      const index = Number(select.dataset.slotIndex);
      const editorItem = select.closest(".editor-item");
      const input = editorItem ? editorItem.querySelector(".editor-input") : null;

      if (select.value === "__custom__") {
        if (input) {
          input.dataset.customEnabled = "true";
          input.disabled = false;
          if (!getLineup()[index].custom) {
            input.value = "";
          }
          input.focus();
        }
        return;
      }

      if (input) {
        input.dataset.customEnabled = "false";
        input.value = "";
        input.disabled = true;
      }

      const libraryDrink = getConfig().libraryById.get(select.value);
      if (libraryDrink) {
        state.lineups[state.category][index] = createSlot(state.category, libraryDrink);
        handleLineupMutation();
      }
      return;
    }

    const input = event.target.closest(".editor-input");
    if (input) {
      updateSlot(Number(input.dataset.slotIndex), input.value);
    }
  });

  elements.editorDialog.addEventListener("click", (event) => {
    if (event.target === elements.editorDialog) {
      closeEditor();
    }
  });

  window.addEventListener("resize", requestWheelDraw);
  window.addEventListener("orientationchange", requestWheelDraw);

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(requestWheelDraw);
    observer.observe(elements.wheelDisc);
  }

  applyRotation(true);
  renderAll();
})();
