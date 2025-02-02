#!/usr/bin/env node
const {
    CLOCKIFY_API_KEY,
CLOCKIFY_WORKSPACE_ID,
CLOCKIFY_USER_ID,
} = process.env


if(!CLOCKIFY_API_KEY) {

    console.error("No Clockify ApiKey found")
    process.exit()
}
