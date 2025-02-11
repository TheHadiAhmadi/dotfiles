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

vim.api.nvim_set_keymap('n', '<space>s', ':Files<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>d', ':Neotree reveal position=left<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>D', ':Neotree toggle<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>f', ':Rg<CR>', { noremap = true, silent = true })

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
vim.api.nvim_set_keymap("n", "<leader>f", "<Plug>(coc-format)", {})


-- Vim
vim.api.nvim_set_keymap('n', '<space>q', ':wq<CR>', { noremap = true, silent = true })

-- Git
vim.api.nvim_set_keymap('n', '<space>gb', ':Git blame<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gs', ':Git<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gc', ':Git commit -v<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>ga', ':Git add -p<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gm', ':Git commit --amend<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gp', ':Git push<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gd', ':Gvdiff<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<space>gw', ':Gwrite<CR>', { noremap = true, silent = true })

vim.api.nvim_set_keymap('n', "<space>j", ":rightbelow vsp term://$SHELL<CR>i", {noremap = true, silent= true})
