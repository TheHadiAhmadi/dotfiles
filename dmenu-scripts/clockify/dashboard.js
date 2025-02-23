#!/usr/bin/env node

import moment from "moment";
import path from "path";
import fs from "fs";

const API_KEY = process.env.CLOCKIFY_API_KEY;
const WORKSPACE_ID = process.env.CLOCKIFY_WORKSPACE_ID;
const USER_ID = process.env.CLOCKIFY_USER_ID;

function loadProjects() {
  const filePath = path.join(process.env.HOME, ".clockify_projects.json");
  if (!fs.existsSync(filePath)) {
    throw new Error("Projects JSON file not found.");
  }
  const projectsData = fs.readFileSync(filePath);
  return JSON.parse(projectsData);
}

async function fetchData() {
  let entries = [];
  const now = moment();
  const startOfMonth = now.startOf("month").toISOString();
  const tenthOfMonth = now.startOf("month").add(10, "days").toISOString();

  const twentiethOfMonth = now.startOf("month").add(20, "days").toISOString();
  const endOfMonth = now.endOf("month").toISOString();

  const url1 = `https://api.clockify.me/api/v1/workspaces/${WORKSPACE_ID}/user/${USER_ID}/time-entries?start=${startOfMonth}&end=${tenthOfMonth}`;
  const url2 = `https://api.clockify.me/api/v1/workspaces/${WORKSPACE_ID}/user/${USER_ID}/time-entries?start=${tenthOfMonth}&end=${twentiethOfMonth}`;
  const url3 = `https://api.clockify.me/api/v1/workspaces/${WORKSPACE_ID}/user/${USER_ID}/time-entries?start=${twentiethOfMonth}&end=${endOfMonth}`;

  try {
    let response1 = fetch(url1, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
      },
    }).then((res) => res.json());

    let response2 = fetch(url2, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
      },
    }).then((res) => res.json());

    let response3 = await fetch(url3, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
      },
    }).then((res) => res.json());

    entries = await Promise.all([response1, response2, response3]).then((res) =>
      res.flat()
    );
    return entries;
  } catch (error) {
    console.error("Error fetching data from Clockify:", error.response.data);
    return [];
  }
}

async function run() {
  const data = await fetchData();
  const projects = loadProjects();
  const projectMap = {};

  // Create a mapping of projectId to project name
  projects.forEach((project) => {
    projectMap[project.id] = project.name;
  });

  const desiredProjects = ["OCR", "yesvelte"]; // List your desired projects here
  const desiredProjects2 = ["Crawler"];
  const dailyProjectData = {};
  const dailyProjectData2 = {};

  // Loop through each entry in the data
  data.forEach((entry) => {
    const projectName = projectMap[entry.projectId];
    const dateKey = moment(entry.timeInterval.start).format("YYYY-MM-DD"); // Extract date in 'YYYY-MM-DD' format
    const duration = entry.timeInterval.duration; // duration is in ISO 8601 format
    const hours = moment.duration(duration).asHours();

    if (desiredProjects.includes(projectName)) {
      // Initialize the project if it doesn't exist for that date
      if (!dailyProjectData[dateKey]) {
        dailyProjectData[dateKey] = 0;
      }

      // Add hours to the respective project for the specific date
      dailyProjectData[dateKey] += hours;
    }
    if (desiredProjects2.includes(projectName)) {
      // Initialize the project if it doesn't exist for that date
      if (!dailyProjectData2[dateKey]) {
        dailyProjectData2[dateKey] = 0;
      }

      // Add hours to the respective project for the specific date
      dailyProjectData2[dateKey] += hours;
    }
  });

  const year = moment().year();
  const month = moment().month();

  // Get the last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  let map = {};
  let map2 = {};

  // Loop through each day of the month and render 0 if there's no value
  for (let day = 1; day <= totalDaysInMonth; day++) {
    // Construct the date string in the format YYYY-MM-DD
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    // Check if there is data for this date; if not, use 0
    const hours = dailyProjectData[dateKey] || 0;
    map[dateKey] = hours;

    const hours2 = dailyProjectData2[dateKey] || 0;
    map2[dateKey] = hours2;

    // Add a bar for this date with combined project hours
  }

  const today = new Date().getDate();

  const totalHours = Object.keys(dailyProjectData)
    .map((x) => dailyProjectData[x])
    .reduce((prev, curr) => prev + curr, 0);
  const totalHours2 = Object.keys(dailyProjectData2)
    .map((x) => dailyProjectData2[x])
    .reduce((prev, curr) => prev + curr, 0);

  const average1 = totalHours / today;
  const average2 = totalHours2 / today;

  process.stdout.write("\n");
  const avg1 =
    "0" + Math.floor(average1) + ":" + (Math.floor(average1 * 60) % 60);
  const avg2 =
    "0" + Math.floor(average2) + ":" + (Math.floor(average2 * 60) % 60);

  const client1 = "Ubeac";
  const client2 = "Armin";
  let message1 =
    " " +
    client1 +
    " (" +
    Object.keys(dailyProjectData)
      .map((x) => dailyProjectData[x])
      .reduce((prev, curr) => prev + curr, 0)
      .toFixed(0) +
    " Hours)" +
    "Avg: (" +
    avg1 +
    ")";

  const spaceCount1 = totalDaysInMonth * 2 - message1.length;
  for (let item in Array.from({ length: spaceCount1 })) {
    if (message1.length == (today * 2) - 2) {

      message1 += "︙";
    } else {
      message1 += " ";
    }
  }

  let message2 =
    " " +
    client2 +
    " (" +
    Object.keys(dailyProjectData2)
      .map((x) => dailyProjectData2[x])
      .reduce((prev, curr) => prev + curr, 0)
      .toFixed(0) +
    " Hours)" +
    " Avg: (" +
    avg2 +
    ")";

  const spaceCount2 = totalDaysInMonth * 2 - message2.length;
  for (let item in Array.from({ length: spaceCount2 })) {
    if (message2.length == today * 2 - 2) {
      message2 += "︙";
    } else {
      message2 += " ";
    }
  }
  for (let i = 9; i > 0; i--) {
    process.stdout.write("\u001b[37m");
    if (i == 9) {
      for (let j = 0; j < 4 * totalDaysInMonth + 7; j++) {
        process.stdout.write("\u2588");
      }
      process.stdout.write("\n");
      continue;
    }
    process.stdout.write("\u2588");
    if (i == 8) {
      process.stdout.write(message1);
      process.stdout.write(" \u2588");
      process.stdout.write(message2);
      process.stdout.write(" \u2588");
        process.stdout.write('\n')
    } else {
      for (let key in map) {
        const today = new Date().getDate();
        if (key.endsWith("-" + today)) {
          process.stdout.write("︙");
        } else {
          // process.stdout.write(' ');
        }
        if (i - map[key] > 0 && i - map[key] < 1) {
          let str = "" + Math.floor(Math.floor(map[key] * 100) % 100);
          str = str.length == 1 ? "0" + str : str;
          const m = Math.floor((+str * 6) / 10);

          const mstr = "" + m;
          process.stdout.write(mstr.length == 1 ? "0" + mstr : mstr);
        } else {
          if (map[key] > i) {
            process.stdout.write("\u001b[32m██\u001b[37m");
          } else {
            process.stdout.write("  ");
          }
        }
      }
      process.stdout.write("\u2588");
      for (let key in map2) {
        // 2.3 10x 9x 3(i - x) < 1
        const today = new Date().getDate();
        if (key.endsWith("-" + today)) {
          process.stdout.write("︙");
        } else {
          // process.stdout.write(' ');
        }
        if (i - map2[key] > 0 && i - map2[key] < 1) {
          let str = "" + Math.floor(Math.floor(map2[key] * 100) % 100);
          str = str.length == 1 ? "0" + str : str;
          const m = Math.floor((+str * 6) / 10);

          const mstr = "" + m;
          process.stdout.write(mstr.length == 1 ? "0" + mstr : mstr);
        } else {
          if (map2[key] > i) {
            process.stdout.write("\u001b[32m██\u001b[37m");
          } else {
            process.stdout.write("  ");
          }
        }
      }
      process.stdout.write("\u2588");
      process.stdout.write("\n");
    }
  }
  for (let i = 0; i < 4 * totalDaysInMonth + 6; i++) {
    process.stdout.write("\u2588");
  }

  // calculate averate daily hours
}

run();

setTimeout(() => process.exit(), 100000);
