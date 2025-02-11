# dotfiles


void linux packages:
<!-- system -->
```
base-system binutils curl dhclient elogind git htop noto-fonts-ttf tree jq pulseaudio pavucontrol-qt xz unzip wget 
```

<!-- wm related -->
```
arandr dmenu dunst feh flameshot fzf neovim polybar ranger sxhkd sxiv xclip tilix zsh
```

<!-- build -->
```
gcc
make
libX11-devel
libXft-devel
libXinerama-devel
```

<!-- applications -->
```
code google-chrome-stable mpv 
```

install:
```bash
# cd into current directory
ln -s $PWD/autostart ~/.config/autostart
ln -s $PWD/bspwm ~/.config/bspwm
ln -s $PWD/polybar ~/.config/polybar
ln -s $PWD/nvim ~/.config/nvim
ln -s $PWD/ranger ~/.config/ranger
ln -s $PWD/sxhkd ~/.config/sxhkd
ln -s $PWD/zshrc ~/.config/zshrc

cd dwm
make
sudo make install
cd ..
```


install oh-my-zsh then:
Edit ~/.zshrc and add following text:
```
export CLOCKIFY_API_KEY=...
export CLOCKIFY_WORKSPACE_ID=...
export CLOCKIFY_USER_ID=...
export OPENAI_BASE_URL=...
export OPENAI_API_KEY=...

export OPENCTI_PASSWORD=...

source ~/.config/zshrc

```



Install mongodb in void linux:
I followed this link to install mongodb server:
https://github.com/uditkarode/void-mongod


to install mongosh and mongodb compass I used deb packages downloaded from main mongodb site.
and extracted with xdeb command
