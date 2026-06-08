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
  addCommandLink("/help");
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
  let startX = 0;
  let startY = 0;
  let currentX = 120;
  let currentY = 120;


  win.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    document.body.classList.add("no-select");
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) {
      return;
    }
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    win.style.transform = `translate(${currentX}px, ${currentY}px)`;
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
/* Command Logic for Links       */
/* ==============================*/

async function handleCommand(cmd) {
  let command = cmd.toLowerCase().trim();

  // store history
  history.unshift(command);
  historyIndex = -1;

  //Handles both types of links
  if (command.startsWith("/")) {
    command = command.slice(1);
  }

  if (command.startsWith("-")) {
    command = "open " + command.slice(1);
  }

  const parts = command.split(" ");
  const base = parts[0];
  const arg = parts[1];


  //Start of Command Logic
  await typeLog("> " + command); //Runs command animation first


  if (command === "") return; //Empty input

  //About command logic
  else if (command === "about") {
    createWindow("about", "About", renderAbout(aboutData));
  }

  //Skills command Logic
  else if (command === "skills") {
    createWindow("skills", "Skills", renderSkills(skillData));
  }

  //Project Command Logic
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

  //Contact Command Logic
  else if (command === "contact") {
    createWindow("contact", "Contact", renderContact(contactData));
  }


  //Clear Command Logic
  else if (command === "clear") { //Opening project windows 
    logs.innerHTML = "";
    disableInput();
    await runInstructSequence();
  }

  //Help Command Logic
  else if (command === "help") {
    await typeLog("---------------");
      addCommandLink("/about");
      addCommandLink("/skills");
      addCommandLink("/projects");
      addCommandLink("/contact");
      addCommandLink("/clear");
      addCommandLink("/help")
    await typeLog("---------------");
  }

  //Incorrect command
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

const aboutData = {
  intro: [
    "Place Holder"
  ],

  education: [
    {
      title: "B.S in Computer Science + AI",
      sub: "Colby College",
      time: "2022 - 2026",
      description: "Description Placeholder"
    }
  ],

  experience: [
    {
      title: "Logistics Coordinator",
      sub: "Colby College",
      time: "2024",
      description: "Description Placeholder"
    }
  ],

  current: [
    {
      title: "Placeholder Title",
      sub: "Placeholder Sub",
      time: "Placeholder of Timeline",
      description: "Placeholder Description"
    }
  ],

  stats: [
    {value: "3", label: "Projects Completed"},
    {value: "2+", label: "Years Experience"}
  ]
};

const skillData = {
  languages: [
    {name: "Python", level: "Advanced"},
    {name: "JavaScript", level: "Advanced"},
    {name: "C++", level: "Basic"}
  ],

  libraries: [
    {name: "NumPy", level: "Advanced"},
    {name: "Pandas", level: "Intermediate"},
    {name: "MatPlotLib", level: "Intermediate"},
    {name: "TensorFlow", level: "Advanced"},
    {name: "Sklearn", level: "Basic"},
    {name: "PyTorch", level: "Advanced"},
    {name: "OpenVC", level: "Basic"}
  ],

  backend: [
    {name: "Flask", level: "Intermediate"},
    {name: "Jinja2", level: "Intermediate"}
  ],

  frontend: [
    {name: "HTML", level: "Intermediate"},
    {name: "CSS", level: "Intermediate"}
  ],

  databases: [
    {name: "PostgreSQL", level: "Basic"}
  ],

  other: []
};

const skillOrder = {
  Advanced: 0,
  Intermediate: 1,
  Basic: 2
};

const contactData = {
  links: [
    {label: "Email", value: "samuel4atilano@icloud.com"},
    {label: "Phone", value: "(915)-246-4364"},
    {label: "LinkedIn", value: "View Profile", href: "https://www.linkedin.com/in/samuel-atilano-a8b311293/"},
    {label: "GitHub", value: "Open GitHub", href: "https://github.com/sam-atil"},
  ],

  availability: "Open to Work",

  content: {
    title: "Contact Me",
    roles: [
      "Machine Learning Engineer",
      "Software Engineer",
      "AI Engineer",
      "Computer Vision Engineer"
    ],
    message: "Email is the best way to reach to me! I typically response within 24-48 hours."
  }
}

/* ==============================*/
/* Window Page Creation Logic    */
/* ==============================*/

//Helper Functions
function renderBlock(title, content) {
  return `
    <div class="card-block">
      <h3>${title}</h3>
      <p>${content}</p>
    </div>
  `;
}

function renderList(title, items) {
  return `
    <div class="card-block">
      <h3>${title}</h3>
      <ul>
        ${items.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderAboutList(title, items) {
  return `
    <div class="card-block">
      <h3>${title}</h3>
      <div>
        ${items.map(item => `
            <div>
              <h4>${item.title}</h4>
              <span class="about-sub">${item.sub}</span>
              <span class="about-time">${item.time}</span>
              <p>${item.description}</p>
            </div>
          `).join("")}
      </div>
    </div>
  `
}

function renderStats(stats){
  return stats.map(stat => `
    <div class="card-block">
      <strong>${stat.value}</strong>
      <span>${stat.label}</span>
    </div>
  `).join("");
}

function renderSkillLevel(skill) {
  return `
    <span class="skill-level ${skill.level}">
      ${skill.name}
    </span>
  `
}

function renderSkillCard(title, skills) {
  const sortedSkills = [...skills].sort((a,b) => skillOrder[a.level] - skillOrder[b.level]);

  const content = skills.length > 0 ? `
      <div class="skill-list">
        ${sortedSkills.map(renderSkillLevel).join("")}
      </div>
    ` : `
      <p class="placeholder">
        Future Additions
      </p>
    `;

  return `
    <div class="card-block">
      <h3>${title}</h3>
      ${content}
    </div>
  `;
}


function renderContactPill(contact){
  const content = `
    <span>${contact.label}</span>
    <p>${contact.value}</p>
  `;

  if (contact.href) {
    return `
      <a class="contact-link" href="${contact.href}" target="_blank" rel="Link Err">
        ${content}
      </a>
    `
  }


  return `
    <div class="card-block">
      ${content}
    </div>
  `;
}

function renderContactGrid() {
  return `
    <div class="contact-grid">
      ${contactData.links.map(renderContactPill).join("")}
    </div>
  `;
}


/* ======= */
/*  About  */
/* ======= */

function renderAbout(data) {
  return `
      <div class="about-main">
        <h1>About Me</h1>
        ${data.intro.map(p => `<p>${p}</p>`).join("")}
      </div>

      <div class="about-column">
        ${renderAboutList("Education", data.education)}
        ${renderAboutList("Experience", data.experience)}
        ${renderAboutList("Current Plans", data.current)}
      </div>

      <div class="work-column">
        ${renderStats(data.stats)}
      </div>
  `
}

/* ========= */
/*   Skill   */
/* ========= */

function renderSkills() {
  return `
    <div class="skill-main">
      <h1>Skills</h1>
      <div class="skill-legend">
        <span class="skill-level Advanced">Advanced</span>
        <span class="skill-level Intermediate">Intermediate</span>
        <span class="skill-level Basic">Basic</span>
      </div>

      <div class="skills-grid">
        ${renderSkillCard("Languages", skillData.languages)}
        ${renderSkillCard("Libraries", skillData.libraries)}
        ${renderSkillCard("Backend", skillData.backend)}
        ${renderSkillCard("Frontend", skillData.frontend)}
        ${renderSkillCard("Databases", skillData.databases)}
        ${renderSkillCard("Other", skillData.other)}
      </div>
    </div>`;
}

/* ========= */
/*  Project  */
/* ========= */


function renderProject(project) {
  return `
    
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
    
  `;
}


/* ========= */
/*  Contact  */
/* ========= */

function renderContactMain() {
  return `
    <div class="card-block contact-main">
      <h2>${contactData.content.title}</h2>
      <p>${contactData.availability}</p>
      <div class="contact-roles">
        <p>Roles Seeking:</p>
        ${contactData.content.roles.map(role => `<span class="role-pill">${role}, </span>`).join("")}
      </div>
      <p>${contactData.content.message}</p>
    </div>
  `;
}

function renderContact() {
  return `
    <div class="contact-container">
      <h1>Contact</h1>
      ${renderContactGrid()}
      ${renderContactMain()}
    </div>
  `;
}

/* ==============================*/
/* Running Program               */
/* ==============================*/

runBootSequence();



