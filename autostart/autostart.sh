#!/usr/bin/bash


setxkbmap -layout us,ir -option grp:alt_shift_toggle &
~/.fehbg &
picom &
#polybar top &
#polybar top2 &
/bin/dbus-run-session /usr/bin/pulseaudio &

# Xinitrc
userresources=$HOME/.Xresources
usermodmap=$HOME/.Xmodmap
sysresources=/etc/X11/xinit/.Xresources
sysmodmap=/etc/X11/xinit/.Xmodmap

# merge in defaults and keymaps

if [ -f $sysresources ]; then
    xrdb -merge $sysresources
fi

if [ -f $sysmodmap ]; then
    xmodmap $sysmodmap
fi

if [ -f "$userresources" ]; then
    xrdb -merge "$userresources"
fi

if [ -f "$usermodmap" ]; then
    xmodmap "$usermodmap"
fi

exec /usr/local/bin/dwm
