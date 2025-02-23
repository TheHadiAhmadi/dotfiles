import {execSync} from 'child_process'

const {CLOCKIFY_WORKSPACE_ID, CLOCKIFY_API_KEY, CLOCKIFY_USER_ID} = process.env


console.log(CLOCKIFY_WORKSPACE_ID, CLOCKIFY_API_KEY)
const api = (path, data= null, method="GET") => fetch('https://api.clockify.me/api/v1' + path, {
    method,
    body: data ? JSON.stringify(data) : null,
  headers: {
    'X-Api-Key': CLOCKIFY_API_KEY,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// Helper: Get current ISO timestamp
const now = () => new Date().toISOString();


const run = (command) => spawn(command, {})


// Helper: Invoke dmenu with a list of options and a prompt.
function dmenu(options, promptText) {
  // Join options with newline
  const input = options.join('\n');
  try {
    // Note: We pipe the options to dmenu.
    const result = execSync(`echo "${input}" | dmenu -l 10 -i -p "${promptText}"`, { encoding: 'utf-8' });
    return result.trim();
  } catch (e) {
    return '';
  }
}

function input(prompt) {
    try {
        const result = execSync(`dmenu -i -p "${prompt}"`, {encoding: 'utf-8'})

      return result

    } catch(err) {
        return '';
    }

}

function notify(title, message) {
  // You can adjust timeout (-t) or urgency as needed.
  execSync(`notify-send -u low -t 3000 "${title}" "${message}"`);
}

async function startTimer() {

  let projects = []
  let projectId = null

  try {
    const url = `/workspaces/${CLOCKIFY_WORKSPACE_ID}/projects`;
    const projects = await api(url);

    if (!projects || projects.length === 0) {
      console.log('No projects found.');
      notify("Clockify", "No projects found.");
      return;
    }

    // Format projects into a list for dmenu.
    const projList = projects.map(proj => `${proj.id}: ${proj.name}`);
    const selected = dmenu(projList, "Projects:");
    if (selected) {
      console.log(`Selected project: ${selected}`);
      projectId = selected.split(':')[0]
      // notify("Clockify", `Selected project: ${selected}`);
    } else {

      console.log("Projects:\n" + projList.join('\n'));
      notify("Clockify", "Projects listed in console.");
    }
  } catch (err) {
    const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error('Error fetching projects:', errorMsg);
    notify("Clockify Error", `Error fetching projects: ${errorMsg}`);
  }


    let description = input("Enter timer description: ")
    if(!description) {
        description = "No description"
    }

    const data = {
        start: now(),
        projectId: projectId,
        description,
        createdWith: 'clockify-dmenu-cli'
    }

    const url = `/workspaces/${CLOCKIFY_WORKSPACE_ID}/time-entries`;

    const response = await api(url, data, "POST")
    console.log(`Started timer: ${response.description}"`)
  notify("Clockify", `Started timer: ${response.description}`)

}

async function dashboard() {
    execSync('~/.bin/clockify-dashboard')
}

async function stopTimer() {
    try {
    const url = `/workspaces/${CLOCKIFY_WORKSPACE_ID}/user/${CLOCKIFY_USER_ID}/time-entries?in-progress=true`;
    const entries = await api(url);

    if (!entries || entries.length === 0) {
      console.log('No running timer found.');
      notify("Clockify", "No running timer found.");
      return;
    }

    // Stop the first running timer.
    const currentEntry = entries[0];
    const updateUrl = `/workspaces/${CLOCKIFY_WORKSPACE_ID}/time-entries/${currentEntry.id}`;
    const updateData = { end: now() };

    await api(updateUrl, updateData, "PATCH");
    console.log(`Stopped timer: ${currentEntry.description}`);
    notify("Clockify", `Stopped timer: ${currentEntry.description}`);
  } catch (err) {
    const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error('Error stopping timer:', errorMsg);
    notify("Clockify Error", `Error stopping timer: ${errorMsg}`);
  }
}

async function showStatus() {
try {
    const url = `/workspaces/${CLOCKIFY_WORKSPACE_ID}/user/${CLOCKIFY_USER_ID}/time-entries?in-progress=true`;
    const entries = await api(url);

    if (!entries || entries.length === 0) {
      console.log('No running timer.');
      notify("Clockify", "No running timer.");
      return;
    }

    const entry = entries[0];
    const statusMsg = `Timer: ${entry.description}\nStarted: ${entry.timeInterval.start} (TODO)`;
    console.log(statusMsg);
    notify("Clockify Status", statusMsg);
  } catch (err) {
    const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error('Error fetching status:', errorMsg);
    notify("Clockify Error", `Error fetching status: ${errorMsg}`);
  }
}

async function listProjects() {

}
async function main() {
  const options = [
    "Start Timer",
    "Stop Timer",
    "Dashboard",
    "Show Status",
    // "List Projects",
    "Exit"
  ];
  const choice = dmenu(options, "Clockify:");

  switch (choice) {
    case "Start Timer":
      await startTimer();
      break;
    case "Dashboard":
      await dashboard();
      break;
    case "Stop Timer":
      await stopTimer();
      break;
    case "Show Status":
      await showStatus();
      break;
    // case "List Projects":
    //   await listProjects();
      break;
    case "Exit":
    default:
      process.exit(0);
  }
}

main()
