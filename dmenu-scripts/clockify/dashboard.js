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
  const startOfMonth = now.startOf("month").add(4.5, "hours").toISOString();
  const tenthOfMonth = now.startOf("month").add(10, "days").toISOString();

  const twentiethOfMonth = now.startOf("month").add(20, "days").toISOString();
  const endOfMonth = now.endOf("month").add(4.5, "hours").toISOString();

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

function timeToString(hours) { 
  if (typeof hours !== 'number') {
    return "Invalid input: Hours must be a number.";
  }

  if (hours < 0) {
    return "Invalid input: Hours must be between 0 and 23.";
  }

  const hh = Math.floor(hours); // Get the integer part for hours
  const mm = Math.round((hours - hh) * 60); // Calculate minutes from the decimal part and round
  const hhString = String(hh).padStart(2, '0'); // Format hours with leading zero if needed
  const mmString = String(mm).padStart(2, '0'); // Format minutes with leading zero if needed

  return `${hhString}:${mmString}`;

}

function minutesToString(hours) {
    return timeToString(hours).split(':')[1]

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
    console.log(entry);
    const dateKey = moment(entry.timeInterval.start)
      .subtract(4.5, "hours")
      .format("YYYY-MM-DD"); // Extract date in 'YYYY-MM-DD' format
    const duration = entry.timeInterval.duration; // duration is in ISO 8601 format
    const hours = moment.duration(duration).asHours();
    console.log(dateKey, hours);

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
  const avg1 = timeToString(average1)
  const avg2 = timeToString(average2)

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
    " Avg: (" +
    avg1 +
    ")";

  const goal1 = 300;
  const goal2 = 250;

  const end1 = "Goal (03:00) ";
  const end2 = "Goal (02:30) ";

  const spaceCount1 = totalDaysInMonth * 2 - message1.length - end1.length;
  for (let item in Array.from({ length: spaceCount1 })) {
    if (message1.length == today * 2 - 2) {
      message1 += "︙";
    } else {
      message1 += " ";
    }
  }
  message1 += end1;

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

  const spaceCount2 = totalDaysInMonth * 2 - message2.length - end2.length;
  for (let item in Array.from({ length: spaceCount2 })) {
    if (message2.length == today * 2 - 2) {
      message2 += "︙";
    } else {
      message2 += " ";
    }
  }
  message2 += end2;
            const green = "\x1b[38;2;80;200;80m";
            const red = "\x1b[38;2;200;80;80m";
            const white = "\x1b[38;2;200;200;200m";

    const remainingHours = ((((goal1 + goal2) * today) - ((totalHours + totalHours2) * 100)) / 100) * 100 / (totalDaysInMonth - today) 

    const messageFooter = `Should Work (${timeToString((remainingHours + goal1 + goal2) / 100)}) Everyday` 
    const footer = `Goal (${timeToString((goal1 + goal2) / 100)}) Current (${timeToString((totalHours + totalHours2) / today)}) ${messageFooter}`
  for (let i = 9; i > 0; i--) {
    process.stdout.write(white);

    if (i == 9) {
      for (let j = 0; j < 4 * totalDaysInMonth + 3; j++) {
        process.stdout.write("\u2588");
      }
      process.stdout.write("\n");
      continue;
    }
    process.stdout.write("\u2588");
    if (i == 8) {
      process.stdout.write(message1);
      process.stdout.write("\u2588");
      process.stdout.write(message2);
      process.stdout.write("\u2588");
      process.stdout.write("\n");
    } else {
      for (let key in map) {
        const today = new Date().getDate();
          const color = map[key] > goal1/100 ? green : red
        if (key.endsWith("-" + today)) {
          process.stdout.write("︙");
        } else {
          // process.stdout.write(' ');
        }
        if (i - map[key] > 0 && i - map[key] < 1) {
            process.stdout.write(color)
          process.stdout.write(minutesToString(map[key]));
            process.stdout.write(white)
        } else {
          if (map[key] > i) {
            process.stdout.write(color);
            process.stdout.write("██" + white);
          } else {
            process.stdout.write("  ");
          }
        }
      }
      process.stdout.write("\u2588");
      for (let key in map2) {
          const color = map2[key] > goal1/100 ? green : red
        // 2.3 10x 9x 3(i - x) < 1
        const today = new Date().getDate();
        if (key.endsWith("-" + today)) {
          process.stdout.write("︙");
        } else {
          // process.stdout.write(' ');
        }
        if (i - map2[key] > 0 && i - map2[key] < 1) {
            process.stdout.write(color)
          process.stdout.write(minutesToString(map2[key]));
            process.stdout.write(white)
        } else {
          if (map2[key] > i) {
            process.stdout.write(color);
            process.stdout.write("██" + white);
          } else {
            process.stdout.write("  ");
          }
        }
      }
      process.stdout.write("\u2588");
      process.stdout.write("\n");
    }
  }
  for (let i = 0; i < 4 * totalDaysInMonth + 3; i++) {
    process.stdout.write("\u2588");
  }
process.stdout.write("\n" + footer)

  // calculate averate daily hours
}

run();

setTimeout(() => process.exit(), 100000);
