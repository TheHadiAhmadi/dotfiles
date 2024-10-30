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

cd dwm
make
sudo make install
cd ..
```