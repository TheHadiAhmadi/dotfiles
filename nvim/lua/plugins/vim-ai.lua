-- Focus on the window with the specified buffer ID
local function focus_window_by_buffer_id(buf_id) -- Get all the window IDs
    local windows = vim.api.nvim_list_wins()

    -- loop through all windows and find the one with the matching buffer id
    for _, win_id in ipairs(windows) do
        local current_buf = vim.api.nvim_win_get_buf(win_id)
        if current_buf == buf_id then
            -- Set focus to the window with the matching buffer
            vim.api.nvim_set_current_win(win_id)
            return
        end
    end
    -- If no window with the given buffer was found
    print("No window found with buffer ID: " .. buf_id)
end

function send_to_ai()
    local selection = vim.fn.getline("'<", "'>")
    local title = ">>> AI chat"

    local ai_buffer_id = nil
    for _,buf in ipairs(vim.api.nvim_list_bufs()) do
        local buf_name = vim.api.nvim_buf_get_name(buf)
        if buf_name:match(title) then
            ai_buffer_id = buf
        end
    end

    if not ai_buffer_id or not vim.api.nvim_buf_is_valid(ai_buffer_id) then
        vim.cmd("AIC /right")
    end

    for _,buf in ipairs(vim.api.nvim_list_bufs()) do
        local buf_name = vim.api.nvim_buf_get_name(buf)
        if buf_name:match(">>> AI chat") then
            ai_buffer_id = buf
        end
    end

    vim.api.nvim_buf_set_lines(ai_buffer_id, -1, -1, false, selection)
    focus_window_by_buffer_id(ai_buffer_id)
end

function trigger_ai()
    print("trigger_ai", vim.fn.mode(), vim.fn.bufname("%"))
    if vim.fn.bufname('%') == '>>> AI chat' then
        vim.cmd(':AIC')
    elseif vim.fn.mode() == "n" or vim.fn.mode() == "v" then
        send_to_ai()
    end
end

function close_ai()
    -- close buffer with title '>>> AI chat'
    local buffers = vim.api.nvim_list_bufs()
    
    -- Iterate through each buffer
    for _, buf in ipairs(buffers) do
        -- Get the name of the buffer
        local name = vim.api.nvim_buf_get_name(buf)

        -- Check if the buffer name matches '>>> AI chat'
        if name:match(">>> AI chat") then
            -- Close the buffer if it matches
            vim.api.nvim_buf_delete(buf, { force = true })
            print("Closed buffer: " .. name)
            return
        end
    end

end

return {
  'madox2/vim-ai',
  opts = {
    options = {
      model = "openai/gpt-4o-mini",
      -- model = "deepseek/deepseek-r1-distill-llama-8b",
      -- model = "deepseek/deepseek-chat:free",
      endpoint_url = "https://openrouter.ai/api/v1/chat/completions",
    }
  },
  config = function(_, opts)
    vim.g.vim_ai_chat = opts
    vim.g.vim_ai_complete = opts
    vim.g.vim_ai_edit = opts

    vim.g.vim_ai_roles_config_file = '~/.config/nvim/ai-rules.ini'

    vim.api.nvim_set_keymap('n', '<space>i', ':AI ', { noremap = true, silent = true })
    vim.api.nvim_set_keymap('n', '<space>t', ':AIC ', { noremap = true, silent = true })
    vim.api.nvim_set_keymap('v', '<space>t', "<,'>:AI ", { noremap = true, silent = true })
    vim.api.nvim_set_keymap('v', '<space>t', "<,'>:AIC /right<CR>", { noremap = true, silent = true })

    vim.api.nvim_set_keymap('n', "<space><S-l>", ":lua close_ai()<CR>", {noremap = true, silent = true})

    vim.api.nvim_set_keymap("n", "<space>l", ":lua trigger_ai()<CR>", {noremap = true, silent = true})
    vim.api.nvim_set_keymap('v', "<space>l", ":lua trigger_ai()<CR>", {noremap = true, silent = true})
  end
}
