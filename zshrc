export PATH=$HOME/.bin:$PATH
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx
fi

