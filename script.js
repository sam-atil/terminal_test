/*==============================*/
/*      Instance Variables      */
/*==============================*/


const input = document.getElementById("input");
const logs = document.getElementById("logs");
const windowLayer = document.getElementById("window-layer");
input.disabled = true;


// Windows Tracker
const openWindows = {};
let zIndexCounter = 10;


// command history
let history = [];
let historyIndex = -1;


/*===============================*/
/* Portfolio Text/Link Functions */
/*===============================*/

// typing animation
function typeLog(text, speed = 15) {
  return new Promise((resolve) => {
    const line = document.createElement("div");
    logs.appendChild(line);

    let i = 0;

    function type() {
      if (i < text.length) {
        line.textContent += text[i];
        i++;
        setTimeout(type, speed);
      } else {
        logs.scrollTop = logs.scrollHeight;
        resolve();
      }
    }

    type();
  });
}

// command links
function addCommandLink(commandText, mode) {
  const line = document.createElement("div");
  line.className = "command-link";
  line.textContent = commandText;

  line.addEventListener("click", ()=> {
    handleCommand(commandText, mode);
  });

  logs.appendChild(line);
  logs.scrollTop = logs.scrollHeight;
}

/*==============================*/
/*  Input Logic Helpers         */
/*==============================*/

//Enabling Input
function enableInput(){
  input.disabled = false;
  setTimeout(() => {
    input.focus();
  }, 50);
}

//Disabling Input
function disableInput(){
  input.disabled = true;
  input.blur();
}


/*==============================*/
/*  Initial Boot Up Animation   */
/*==============================*/

const bootLines = [
  "Switching to dream mode...",
  "Saving training model weights...",
  "Clamping output layer...",
  "Unclamping input layer...",
  "Leaving GPU running and power on",
];

async function runBootSequence() {
  //Disable Input at start
  disableInput();

  for (let line of bootLines) {
    await typeLog(line, 30);
  }

  logs.innerHTML = "";

  await runInstructSequence();
  //Enable Input at End
}

/* ==============================*/
/*     Instruction Sequence      */
/* ==============================*/
const instructLines = [
  "Welcome to my portfolio, to navigate either type in the command or click on a directory to view content.",
  "Use the 'clear' command to clean the terminal",
  "Use the 'help' command to view available commands",
  "List of available commands:"
];

async function runInstructSequence() {
  for (let line of instructLines) {
    await typeLog(line);
  }
  await typeLog("---------------");
  addCommandLink("/about");
  addCommandLink("/skills");
  addCommandLink("/projects");
  addCommandLink("/contact");
  addCommandLink("/clear");
  await typeLog("---------------");
  enableInput();
}

/*==============================*/
/*     Window Screen Logic      */
/*==============================*/




function focusWindow(win) {
  win.style.zIndex = zIndexCounter++;
}




function createWindow(id, title, content) {
  if (openWindows[id]) {
    focusWindow(openWindows[id]);
    return;
  }

  const win = document.createElement("div");
  win.className = "window";
  win.style.zIndex = zIndexCounter++;

  win.innerHTML = `
    <div class="window-header">
      <span>${title}</span>
      <span class="close-btn">✕</span>
    </div>
    <div class="window-body">
      ${content}
    </div>
  `;

  const header = win.querySelector(".window-header");

  openWindows[id] = win;

  win.addEventListener("mousedown", () => {
    focusWindow(win);
  });

  win.querySelector(".close-btn").onclick = () => {
    delete openWindows[id];
    win.remove();
  };

  // DRAG
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.classList.add("no-select");
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      win.style.left = e.clientX - offsetX + "px";
      win.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.classList.remove("no-select");
  });

  windowLayer.appendChild(win);

  setTimeout(() => {
    win.classList.add("open");
  }, 10);
}

/* ==============================*/
/* Project Data                  */
/* ==============================*/

const projects = {
  "dream_terminal(placeholder)": {
    title: "Dream Terminal Portfolio",
    description: "Terminal Style Portfolio UI",
    problem: "Traditional Portfolios lack interactivity",
    approach: "built command-driven HUD interface",
    results: "Created dynamic terminal system",
    improvements: "Add persistence animations",
    tech: ["HTML", "CSS", "JavaScript"],
    learnings: "UI Architecture, command parsing, UX Systems"
  }
};

/* ==============================*/
/* Command Logic                  */
/* ==============================*/

async function handleCommand(cmd) {
  let command = cmd.toLowerCase().trim();

  if (command.startsWith("/")) {
    command = command.slice(1);
  }

  if (command.startsWith("-")) {
    command = "open " + command.slice(1);
  }

  const parts = command.split(" ");
  const base = parts[0];
  const arg = parts[1];

  if (command === "") return;

  // store history
  history.unshift(command);
  historyIndex = -1;

  await typeLog("> " + command);

  if (command === "help") {
    await typeLog("about");
    await typeLog("projects");
    await typeLog("open [project]");
    await typeLog("clear");
  }

  else if (command === "about") {
    createWindow("about", "About", `
      <p>I build AI-driven interfaces and systems.</p>
    `);
  }

  else if (command === "projects") {
    await typeLog("available projects:");
    Object.keys(projects).forEach((key) => {
      addCommandLink("-" + key);
    });
    await typeLog("use: open [project-name]");
  }

  else if (base === "open") { //Opening project windows 
    if (!arg) {
      await typeLog("please specify a project");
      return;
    }

    const project = projects[arg];

    if (!project) {
      await typeLog("project not found");
      return;
    }

    createWindow(arg, project.title, renderProject(project));
  }

  else if (command === "clear") { //Opening project windows 
    logs.innerHTML = "";
    disableInput();
    await runInstructSequence();
  }

  else {
    await typeLog("unknown command");
  }
}

/* ==============================*/
/* Command Input Logic                   */
/* ==============================*/

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const value = input.value;
    input.value = "";
    disableInput();

    handleCommand(value).then(() => {
      enableInput();
    });
  }

  // UP ARROW (previous command)
  if (e.key === "ArrowUp") {
    if (history.length > 0) {
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      input.value = history[historyIndex];
    }
  }

  // DOWN ARROW (forward)
  if (e.key === "ArrowDown") {
    historyIndex = Math.max(historyIndex - 1, -1);
    input.value = historyIndex === -1 ? "" : history[historyIndex];
  }
});

/* ==============================*/
/* Project Logic               */
/* ==============================*/

//Helper Functions
function renderBlock(title, content) {
  return `
    <div class="project-card-block">
      <h3>${title}</h3>
      <p>${content}</p>
    </div>
  `;
}

function renderList(title, items) {
  return `
    <div class="project-card-side">
      <h3>${title}</h3>
      <ul>
        ${items.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}


function renderProject(project) {
  return `
    <div class="project-window">
      <div class="project-main">
        <h1>${project.title}</h1>
        <p>${project.description}</p>
      </div>

      <div class="project-columns">
        <div class="project-left">
          ${renderBlock("Problem Statement", project.problem)}
          ${renderBlock("Technical Approach", project.approach)}
          ${renderBlock("Results", project.results)}
          ${renderBlock("Improvements", project.improvements)}
        </div>

        <div class="project-right">
          ${renderList("Tech Stack", project.tech)}
          ${renderBlock("Key Learnings", project.learnings)}
        </div>
      </div>
    </div>
  `;
}


/* ==============================*/
/* Running Program               */
/* ==============================*/

runBootSequence();



