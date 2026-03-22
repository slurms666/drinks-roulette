(function () {
  const root = window.Pebbs3310;
  const utils = root.utils;
  const games = root.games.slice();
  const gameLookup = Object.fromEntries(games.map((game) => [game.id, game]));

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const elements = {
    panelView: document.getElementById("panel-view"),
    overlayView: document.getElementById("overlay-view"),
    screenTitle: document.getElementById("screen-title"),
    screenMeta: document.getElementById("screen-meta"),
    footerLeft: document.getElementById("footer-left"),
    footerCenter: document.getElementById("footer-center"),
    footerRight: document.getElementById("footer-right"),
    infoTitle: document.getElementById("info-title"),
    infoCopy: document.getElementById("info-copy"),
    infoList: document.getElementById("info-list"),
    soundToggle: document.getElementById("sound-toggle"),
  };

  const audio = root.createAudioEngine("pebbs-3310-sound");

  const input = {
    held: {
      left: false,
      right: false,
      up: false,
      down: false,
    },
  };

  const state = {
    view: "menu",
    menuId: "main",
    menuSelection: {
      main: 0,
      games: 0,
    },
    activePanel: null,
    activeGame: null,
    gameState: null,
    overlay: null,
    helpSeen: readJson("pebbs-3310-help-seen", {}),
    lastFrame: performance.now(),
  };

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore local file storage failures.
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function currentMenuIndex() {
    return state.menuSelection[state.menuId] || 0;
  }

  function setCurrentMenuIndex(index) {
    state.menuSelection[state.menuId] = index;
  }

  function getMenuWindow(items, selectedIndex, maxVisible) {
    const visibleCount = Math.min(items.length, maxVisible);
    const half = Math.floor(visibleCount / 2);
    const start = utils.clamp(selectedIndex - half, 0, Math.max(0, items.length - visibleCount));
    return {
      start,
      end: start + visibleCount,
      visibleCount,
    };
  }

  function phaseLabel(phase) {
    if (phase === "ready") {
      return "Ready";
    }
    if (phase === "playing") {
      return "Playing";
    }
    if (phase === "win") {
      return "Clear";
    }
    if (phase === "gameover") {
      return "Game Over";
    }
    return "Active";
  }

  function globalControlLines() {
    return [
      "Arrows move and navigate",
      "Enter confirms or uses the main action",
      "Space triggers a secondary action",
      "Escape or Backspace backs out",
      "M toggles sound, R restarts, I opens help",
    ];
  }

  function getMainMenuItems() {
    return [
      {
        label: "Play Games",
        description: "Open the game shelf and launch one of the 10 mini-games.",
        details: ["10 playable games", "Canvas-driven arcade modes", "Escape returns to the menu"],
        action() {
          openMenu("games");
        },
      },
      {
        label: "Controls",
        description: "Read the shared controls and per-game hints before you play.",
        details: globalControlLines(),
        action() {
          openPanel("controls");
        },
      },
      {
        label: "About",
        description: "Read the project note and the legal-safe tribute statement.",
        details: [
          "Original pixel art and CSS chrome",
          "Inspired by early mobile gaming culture",
          "Not an official Nokia product",
        ],
        action() {
          openPanel("about");
        },
      },
      {
        label: `Sound ${audio.isMuted() ? "Off" : "On"}`,
        description: "Toggle the generated menu and gameplay bleeps.",
        details: [
          `Current status: ${audio.isMuted() ? "Muted" : "Audible"}`,
          "Visible button also works outside the phone shell",
          "Your preference is saved locally",
        ],
        action() {
          toggleSound(true);
        },
      },
    ];
  }

  function getGamesMenuItems() {
    return games.map((game) => ({
      label: game.menuTitle || game.title,
      description: game.description,
      tagline: game.tagline,
      details: [game.tagline, game.controls[0], game.controls[1]],
      action() {
        launchGame(game.id);
      },
      gameId: game.id,
    }));
  }

  function getMenuConfig() {
    if (state.menuId === "games") {
      return {
        title: "Play Games",
        kicker: "Game Shelf",
        copy: "Choose a title, press Enter to launch it, and use Escape to return to the phone menu.",
        items: getGamesMenuItems(),
      };
    }

    return {
      title: "Phone Menu",
      kicker: "Main Menu",
      copy: "Navigate the hub with the arrow keys. The close-up LCD area is the main viewport for menus and games.",
      items: getMainMenuItems(),
    };
  }

  function updateSoundUi() {
    const muted = audio.isMuted();
    elements.soundToggle.textContent = `Sound: ${muted ? "Off" : "On"}`;
    elements.soundToggle.setAttribute("aria-pressed", muted ? "true" : "false");
  }

  function setStatus(title, meta) {
    elements.screenTitle.textContent = title;
    elements.screenMeta.textContent = meta;
  }

  function setFooter(left, center, right) {
    elements.footerLeft.textContent = left;
    elements.footerCenter.textContent = center;
    elements.footerRight.textContent = right;
  }

  function setInfo(title, copy, items) {
    elements.infoTitle.textContent = title;
    elements.infoCopy.textContent = copy;
    elements.infoList.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function openMenu(menuId) {
    clearHeldInput();
    state.view = "menu";
    state.menuId = menuId;
    state.activePanel = null;
    state.activeGame = null;
    state.gameState = null;
    state.overlay = null;
    renderActiveView();
  }

  function openPanel(panelId) {
    clearHeldInput();
    state.view = "panel";
    state.activePanel = panelId;
    state.overlay = null;
    renderActiveView();
  }

  function buildOverlayHtml(overlayState) {
    const instructionItems = overlayState.instructions
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");
    const controlItems = overlayState.controls
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");

    return `
      <div class="overlay-card">
        <p class="panel-kicker">${escapeHtml(overlayState.kicker)}</p>
        <h3>${escapeHtml(overlayState.title)}</h3>
        <p class="overlay-copy">${escapeHtml(overlayState.description)}</p>
        <div class="overlay-section">
          <strong>How it works</strong>
          <ul>${instructionItems}</ul>
        </div>
        <div class="overlay-section">
          <strong>Controls</strong>
          <ul>${controlItems}</ul>
        </div>
        <div class="overlay-actions">
          <span>Enter close</span>
          <span>Esc back</span>
        </div>
      </div>
    `;
  }

  function showGameHelp(isFirstVisit) {
    if (!state.activeGame) {
      return;
    }

    if (isFirstVisit) {
      state.helpSeen[state.activeGame.id] = true;
      writeJson("pebbs-3310-help-seen", state.helpSeen);
    }

    state.overlay = {
      kicker: isFirstVisit ? "First Play" : "Instructions",
      title: state.activeGame.title,
      description: state.activeGame.description,
      instructions: state.activeGame.instructions,
      controls: state.activeGame.controls,
    };
    renderOverlay();
  }

  function closeOverlay() {
    state.overlay = null;
    renderOverlay();
  }

  function renderOverlay() {
    if (state.view !== "game" || !state.overlay) {
      elements.overlayView.classList.add("hidden");
      elements.overlayView.innerHTML = "";
      return;
    }

    elements.overlayView.classList.remove("hidden");
    elements.overlayView.innerHTML = buildOverlayHtml(state.overlay);
  }

  function launchGame(gameId) {
    const game = gameLookup[gameId];
    clearHeldInput();
    state.view = "game";
    state.activeGame = game;
    state.gameState = game.createState();
    state.overlay = null;
    renderActiveView();

    if (!state.helpSeen[gameId]) {
      showGameHelp(true);
    }
  }

  function restartGame() {
    if (!state.activeGame) {
      return;
    }

    clearHeldInput();
    state.gameState = state.activeGame.createState();
    state.overlay = null;
    renderActiveView();
  }

  function exitGame() {
    clearHeldInput();
    state.activeGame = null;
    state.gameState = null;
    state.overlay = null;
    openMenu("games");
  }

  function renderMenu() {
    updateSoundUi();
    const menu = getMenuConfig();
    const items = menu.items;
    const isGamesMenu = state.menuId === "games";
    let selectedIndex = currentMenuIndex();
    selectedIndex = utils.clamp(selectedIndex, 0, items.length - 1);
    setCurrentMenuIndex(selectedIndex);
    const selectedItem = items[selectedIndex];
    const menuWindow = getMenuWindow(items, selectedIndex, isGamesMenu ? 5 : items.length);
    const visibleItems = items.slice(menuWindow.start, menuWindow.end);
    const hasMoreAbove = menuWindow.start > 0;
    const hasMoreBelow = menuWindow.end < items.length;

    canvas.classList.add("hidden");
    elements.panelView.classList.remove("hidden");
    elements.overlayView.classList.add("hidden");

    setStatus(menu.title, audio.isMuted() ? "Muted" : "Ready");
    setFooter(
      isGamesMenu ? "Arrows browse" : "Arrows scroll",
      isGamesMenu ? "Enter launch" : "Enter select",
      state.menuId === "main" ? "M sound" : "Esc back"
    );

    elements.panelView.innerHTML = `
      <div class="panel-shell">
        <div class="panel-head">
          <p class="panel-kicker">${escapeHtml(menu.kicker)}</p>
          <h2 class="panel-title">${escapeHtml(menu.title)}</h2>
          <p class="panel-copy">${escapeHtml(menu.copy)}</p>
        </div>
        <div class="menu-list ${isGamesMenu ? "is-compact" : ""}">
          ${visibleItems
            .map(
              (item, index) => `
                <button
                  type="button"
                  class="menu-item ${menuWindow.start + index === selectedIndex ? "is-active" : ""}"
                  data-menu-index="${menuWindow.start + index}"
                >
                  <strong>${escapeHtml(item.label)}</strong>
                  <span>${escapeHtml(isGamesMenu ? item.tagline || item.description : item.description)}</span>
                </button>
              `
            )
            .join("")}
        </div>
        ${
          isGamesMenu
            ? `
              <div class="menu-scroll-note">
                <span>${hasMoreAbove ? "More above" : "Top of list"}</span>
                <span>${menuWindow.start + 1}-${menuWindow.end} / ${items.length}</span>
                <span>${hasMoreBelow ? "More below" : "End of list"}</span>
              </div>
            `
            : ""
        }
        <div class="panel-footer">
          <span>${state.menuId === "games" ? "10 titles loaded" : "Use keyboard only"}</span>
          <span>${audio.isMuted() ? "Sound muted" : "Sound active"}</span>
        </div>
      </div>
    `;

    setInfo(
      selectedItem.label,
      selectedItem.description,
      selectedItem.details || ["Enter opens this item", "Escape goes back", "M toggles sound"]
    );
  }

  function renderPanel() {
    updateSoundUi();
    canvas.classList.add("hidden");
    elements.panelView.classList.remove("hidden");
    elements.overlayView.classList.add("hidden");

    const controlsCopy =
      "Every part of the project is keyboard controllable. The menu, instructions, and each canvas game follow the same shared controls.";
    const aboutCopy =
      "3310 Game Hub is an original Pebbs.app tribute that evokes late-1990s mobile game culture without using official Nokia assets or copyrighted game code.";
    const isControls = state.activePanel === "controls";

    setStatus(isControls ? "Controls" : "About", isControls ? "Guide" : "Project");
    setFooter("Arrows read", "Enter menu", "Esc back");

    if (isControls) {
      const controlItems = globalControlLines()
        .concat(games.map((game) => `${game.menuTitle}: ${game.controls[0]} | ${game.controls[1]}`))
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");

      elements.panelView.innerHTML = `
        <div class="panel-shell">
          <div class="panel-head">
            <p class="panel-kicker">Controls</p>
            <h2 class="panel-title">Shared Input</h2>
            <p class="panel-copy">${escapeHtml(controlsCopy)}</p>
          </div>
          <ul class="text-list">${controlItems}</ul>
          <div class="panel-footer">
            <span>I opens game help</span>
            <span>R restarts active play</span>
          </div>
        </div>
      `;

      setInfo("Controls", controlsCopy, globalControlLines());
      return;
    }

    const aboutItems = [
      "10 original mini-games inspired by early handset design",
      "Static HTML, CSS, and vanilla JavaScript only",
      "No backend, API routes, databases, or external assets required",
      "Ready for local file play and static deployment on Vercel",
    ]
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");

    elements.panelView.innerHTML = `
      <div class="panel-shell">
        <div class="panel-head">
          <p class="panel-kicker">About</p>
          <h2 class="panel-title">Retro Tribute</h2>
          <p class="panel-copy">${escapeHtml(aboutCopy)}</p>
        </div>
        <ul class="text-list">${aboutItems}</ul>
        <div class="panel-footer">
          <span>Not an official Nokia product</span>
          <span>By Pebbs.app</span>
        </div>
      </div>
    `;

    setInfo("About", aboutCopy, [
      "Original CSS phone shell",
      "Original canvas sprites and sounds",
      "Designed for keyboard-first desktop play",
    ]);
  }

  function updateGameUi() {
    const game = state.activeGame;
    const gameState = state.gameState;
    if (!game || !gameState) {
      return;
    }

    setStatus(game.title, phaseLabel(gameState.phase));
    setFooter("Arrows play", "Enter / Space action", "Esc menu");
    setInfo(
      game.title,
      `${phaseLabel(gameState.phase)} state. ${game.description}`,
      game.controls.concat(["I reopens this help overlay"])
    );
  }

  function renderGame() {
    canvas.classList.remove("hidden");
    elements.panelView.classList.add("hidden");
    updateGameUi();

    if (state.activeGame && state.gameState) {
      state.activeGame.render(ctx, state.gameState, utils);
    }

    renderOverlay();
  }

  function renderActiveView() {
    if (state.view === "menu") {
      renderMenu();
      return;
    }

    if (state.view === "panel") {
      renderPanel();
      return;
    }

    renderGame();
  }

  function handleMenuAction(action) {
    const menu = getMenuConfig();
    const items = menu.items;
    let index = currentMenuIndex();

    if (action === "up") {
      index = utils.wrap(index - 1, 0, items.length - 1);
      setCurrentMenuIndex(index);
      audio.play("move");
      renderMenu();
      return;
    }

    if (action === "down") {
      index = utils.wrap(index + 1, 0, items.length - 1);
      setCurrentMenuIndex(index);
      audio.play("move");
      renderMenu();
      return;
    }

    if (action === "primary" || action === "right") {
      audio.play("select");
      items[index].action();
      return;
    }

    if (action === "back" || action === "left") {
      if (state.menuId === "games") {
        audio.play("back");
        openMenu("main");
      } else {
        audio.play("back");
      }
    }
  }

  function handlePanelAction(action) {
    if (action === "primary" || action === "back" || action === "left") {
      audio.play("back");
      openMenu("main");
    }
  }

  function handleGameAction(action) {
    if (!state.activeGame || !state.gameState) {
      return;
    }

    if (state.overlay) {
      if (action === "primary" || action === "secondary" || action === "back") {
        audio.play("back");
        closeOverlay();
      }
      return;
    }

    if (action === "back") {
      audio.play("back");
      exitGame();
      return;
    }

    if (action === "restart") {
      audio.play("select");
      restartGame();
      return;
    }

    if (action === "help") {
      audio.play("move");
      showGameHelp(false);
      return;
    }

    state.activeGame.handleInput(state.gameState, action, input, root, audio);
  }

  function toggleSound(playEffect) {
    const wasMuted = audio.isMuted();
    audio.toggleMute();
    updateSoundUi();
    if (playEffect && wasMuted) {
      audio.play("select");
    }
    renderActiveView();
  }

  function keyToAction(key) {
    const keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      Enter: "primary",
      " ": "secondary",
      Escape: "back",
      Backspace: "back",
      m: "mute",
      M: "mute",
      r: "restart",
      R: "restart",
      i: "help",
      I: "help",
    };

    return keyMap[key] || null;
  }

  function keyToHeldDirection(key) {
    const heldMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };

    return heldMap[key] || null;
  }

  function onKeyDown(event) {
    const action = keyToAction(event.key);
    const heldDirection = keyToHeldDirection(event.key);

    if (action || heldDirection) {
      event.preventDefault();
    }

    audio.unlock();

    if (heldDirection) {
      input.held[heldDirection] = true;
    }

    if (!action) {
      return;
    }

    if (action === "mute") {
      toggleSound(true);
      return;
    }

    if (state.view === "menu") {
      handleMenuAction(action);
      return;
    }

    if (state.view === "panel") {
      handlePanelAction(action);
      return;
    }

    handleGameAction(action);
  }

  function onKeyUp(event) {
    const heldDirection = keyToHeldDirection(event.key);
    if (heldDirection) {
      input.held[heldDirection] = false;
    }
  }

  function clearHeldInput() {
    Object.keys(input.held).forEach((key) => {
      input.held[key] = false;
    });
  }

  function animationLoop(now) {
    const dt = Math.min(0.05, (now - state.lastFrame) / 1000);
    state.lastFrame = now;

    if (state.view === "game" && state.activeGame && state.gameState && !state.overlay) {
      state.activeGame.update(state.gameState, dt, input, audio);
    }

    if (state.view === "game" && state.activeGame && state.gameState) {
      renderGame();
    }

    window.requestAnimationFrame(animationLoop);
  }

  elements.soundToggle.addEventListener("click", () => {
    audio.unlock();
    toggleSound(true);
  });

  elements.panelView.addEventListener("click", (event) => {
    const button = event.target.closest("[data-menu-index]");
    if (!button || state.view !== "menu") {
      return;
    }

    const index = Number(button.getAttribute("data-menu-index"));
    setCurrentMenuIndex(index);
    renderMenu();
    const menu = getMenuConfig();
    menu.items[index].action();
  });

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener(
    "pointerdown",
    () => {
      audio.unlock();
    },
    { once: true }
  );
  window.addEventListener("blur", clearHeldInput);

  renderActiveView();
  window.requestAnimationFrame(animationLoop);
})();
