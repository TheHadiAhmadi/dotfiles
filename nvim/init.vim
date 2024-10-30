set number
set relativenumber

syntax on
set clipboard=unnamedplus


set tabstop=4
set shiftwidth=4
set expandtab

set mouse=a

set incsearch

set hlsearch

set ignorecase
set smartcase

set showmatch

set wrap

set scrolloff=10

set laststatus=2

set noswapfile

set encoding=utf-8

filetype plugin indent on

call plug#begin('~/.local/share/nvim/plugged')

" Example plugins
Plug 'tpope/vim-sensible'  " A set of sensible defaults
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }  " Fuzzy file finder
Plug 'junegunn/fzf.vim'    " FZF integration for Vim
Plug 'hrsh7th/nvim-cmp'                 " Autocompletion plugin
Plug 'hrsh7th/cmp-nvim-lsp'             " LSP source for nvim-cmp
Plug 'hrsh7th/cmp-buffer'               " Buffer completions
Plug 'hrsh7th/cmp-path'  

Plug 'sheerun/vim-polyglot'
Plug 'vito-c/jq.vim'

Plug 'pangloss/vim-javascript'
Plug 'joshdick/onedark.vim'

Plug 'tpope/vim-fugitive'
Plug 'nvim-tree/nvim-tree.lua'
call plug#end()


nnoremap <C-p> :Files<CR>
nnoremap <leader>b :Buffers<CR>


colorscheme onedark

