require("config.lazy")

vim.opt.relativenumber = true

vim.opt.clipboard = "unnamedplus"

vim.opt.tabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true

vim.opt.mouse = "a"

vim.opt.incsearch = true

vim.opt.hlsearch = true

vim.opt.ignorecase = true
vim.opt.smartcase = true

vim.opt.showmatch = true

vim.opt.wrap = true

vim.opt.scrolloff = 10

vim.opt.laststatus = 2
vim.opt.fileformat = "unix"

vim.opt.swapfile = false

vim.opt.encoding = "utf-8"


vim.opt.hidden = true
vim.opt.updatetime = 300
vim.opt.shortmess:append("c")
vim.opt.signcolumn = "yes"

vim.api.nvim_set_keymap('n', '<space>f', ':Files<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>d', ':Neotree reveal position=left<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>D', ':Neotree toggle<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>s', ':Rg<CR>', { noremap = true, silent = true })

-- Set colorscheme
vim.cmd('colorscheme gruvbox')

-- Disable backup and write backup
vim.opt.backup = false
vim.opt.writebackup = false


-- Tab completion
vim.api.nvim_set_keymap("i", "<TAB>", "pumvisible() ? '<C-n>' : '<TAB>'", { expr = true, noremap = true, silent = true })
vim.api.nvim_set_keymap("i", "<S-TAB>", "pumvisible() ? '<C-p>' : '<S-TAB>'",
    { expr = true, noremap = true, silent = true })

-- Use enter to confirm completion
vim.api.nvim_set_keymap("i", "<CR>", "pumvisible() ? coc#_select_confirm() : '<CR>'", { expr = true, noremap = true })

-- Navigate diagnostics
vim.api.nvim_set_keymap("n", "[d", "<Plug>(coc-diagnostic-prev)", {})
vim.api.nvim_set_keymap("n", "]d", "<Plug>(coc-diagnostic-next)", {})

-- Code navigation
vim.api.nvim_set_keymap("n", "gd", "<Plug>(coc-definition)", {})
vim.api.nvim_set_keymap("n", "gy", "<Plug>(coc-type-definition)", {})
vim.api.nvim_set_keymap("n", "gi", "<Plug>(coc-implementation)", {})
vim.api.nvim_set_keymap("n", "gr", "<Plug>(coc-references)", {})

-- Formatting
vim.api.nvim_set_keymap("n", "<leader><S-f>", "<Plug>(coc-format)", {})


-- Vim
vim.api.nvim_set_keymap('n', '<space>q', ':lua save_and_quit()<CR>', { noremap = true, silent = true })

function save_and_quit()
    if vim.bo.modifiable then
        vim.cmd('wq')
    else
        print("Cannot write to this file.")
        vim.cmd('q')
    end
end

-- Git
vim.api.nvim_set_keymap('n', '<space>gb', ':Git blame<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gs', ':Git<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gc', ':Git commit -v<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>ga', ':Git add -p<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gm', ':Git commit --amend<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gp', ':Git push<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gd', ':Gvdiff<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gw', ':Gwrite<CR>', { noremap = true, silent = true })

vim.api.nvim_set_keymap('n', "<C-j>", ":rightbelow vsp term://$SHELL<CR>i", { noremap = true, silent = true })


--- Clockify
local api_key = os.getenv("CLOCKIFY_API_KEY")  -- Set this environment variable with your Clockify API key
local clockify_workspace_id = os.getenv("CLOCKIFY_WORKSPACE_ID")  -- Set environment variable for your workspace ID
local clockify_user_id = os.getenv("CLOCKIFY_USER_ID")  -- Set environment variable for your Clockify user ID
local function read_json_file(file_path)
    local file = io.open(file_path, "r")
    if not file then
        print("Could not open file: " .. file_path)
        return nil
    end
    local content = file:read("*a")
    file:close()
    return vim.json.decode(content)
end

function start_timer()
    local input = vim.fn.input("Enter Clockify project and description: \nPROJECT: description\n")

    local projects = read_json_file("/home/hadi/.clockify_projects.json")

    local project_name, description = input:match("^(.*): (.*)$");

    if project_name and description then

        local project_id = nil
        for _, project in ipairs(projects) do
            if project.name == project_name then
                project_id = project.id  -- Return the project ID if found
            end
        end
        if not project_id then
            vim.notify("[Clockify] Project not found: " .. project_name, vim.log.levels.ERROR)
            return
        end
        local start_time = os.date("!%Y-%m-%dT%H:%M:%SZ")

        vim.notify("\n[Clockify] Starting timer...")

        local command = string.format(
            "curl --no-progress-meter -X POST https://api.clockify.me/api/v1/workspaces/%s/time-entries " ..
            "-H 'X-Api-Key: %s' " ..
            "-H 'Content-Type: application/json' " ..
            "-d '{\"start\": \"%s\", \"projectId\": \"%s\"," ..
            "\"description\": \"%s\", \"createdWith\":\"clockify-nvim\"}'",
            clockify_workspace_id,
            api_key,
            start_time,
            project_id,
            description
        )
        curl(command, function (result) 
            if result then
                vim.notify("[Clockify] Timer started successfully: " .. result.id, vim.log.levels.INFO)
            else
                vim.notify("[Clockify] Failed to start timer!", vim.log.levels.WARN)
            end

        end) 
    else
        vim.notify("Invalid Input format please use 'project: description' format", vim.log.levels.ERROR)
    end
end

function get_current_timer()
    local command = string.format(
        "curl --no-progress-meter https://api.clockify.me/api/v1/workspaces/%s/user/%s/time-entries\\?in-progress=true " ..
        "-H 'X-Api-Key: %s' " ..
        "-H 'Content-Type: application/json' ",
        clockify_workspace_id,
        clockify_user_id,
        api_key,
        clockify_user_id
    )

    vim.notify("[Clockify] Getting details of currently running timer...")
    curl(command, function (result) 
        if result and result[1] then
            local project_name = result[1].projectId
            local projects = read_json_file("/home/hadi/.clockify_projects.json")
            for _, project in ipairs(projects) do
                if project.id == result[1].projectId then
                    project_name = project.name
                end
            end
            vim.notify("[Clockify] Timer is currently running for " .. project_name .. ": " .. result[1].description, vim.log.levels.INFO)
        else
            vim.notify("[Clockify] Timer is not running!", vim.log.levels.INFO)
        end
    end)
end

function curl(command, on_response)
    vim.fn.jobstart(command, {on_stdout = function(_, data)
        if data then
            local output = table.concat(data, '')
            if #output == 0 then
                -- vim.notify("Empty output from command.", vim.log.levels.ERROR)
                return;
            end
            local json_data = vim.json.decode(output)

            on_response(json_data)
        end
    end,
    on_stderr = function(_, data)
        message = table.concat(data, "\n")
        if #message > 0 then
            vim.notify("Error while fetching request: " .. message, vim.log.levels.ERROR)
        end
    end
})
end

function stop_timer()
    local confirm = vim.fn.input("Are you sure you want to stop the timer? (y/n): ")

    -- local timer_id = get_current_timer_id()
    local end_time = os.date("!%Y-%m-%dT%H:%M:%SZ")

    if confirm == 'y' then
        -- Set up the HTTP request to stop the timer
        local command = string.format(
            "curl --no-progress-meter -X PATCH https://api.clockify.me/api/v1/workspaces/%s/user/%s/time-entries " ..
            "-H 'X-Api-Key: %s' " ..
            "-H 'Content-Type: application/json' -d '{\"end\": \"%s\"}'",
            clockify_workspace_id,
            clockify_user_id,
            api_key,
            end_time
        )

        vim.notify("\n[Clockify] stopping timer...")
        curl(command, function (data) 
            if data and data.description then
                vim.notify("[Clockify] Timer stopped successfully: " .. data.description)
            else
                vim.notify("[Clockify] No timer is running!", vim.log.levels.ERROR)
            end
        end)
    else
        vim.notify("Timer stop canceled.")
    end
end


vim.api.nvim_set_keymap("n", "<space>cc", ":lua start_timer()<CR>", {noremap = true, silent=true})
vim.api.nvim_set_keymap("n", "<space>cs", ":lua stop_timer()<CR>", {noremap = true, silent=true})
vim.api.nvim_set_keymap("n", "<space>c", ":lua get_current_timer()<CR>", {noremap = true, silent=true})


vim.api.nvim_set_keymap("n", "<space>h", "<C-w>h", {noremap= true, silent= true})
vim.api.nvim_set_keymap("n", "<space>j", "<C-w>j", {noremap= true, silent= true})
vim.api.nvim_set_keymap("n", "<space>k",  "<C-w>k", {noremap= true, silent= true})
vim.api.nvim_set_keymap("n", "<space>l",  "<C-w>l", {noremap= true, silent= true})

