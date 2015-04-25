#!/bin/bash
# Redirect 'sdtout' and 'stderr'
exec 1>> /tmp/simple-dock-install
exec 1>> /tmp/outfile 2>&1
# Install extension
mkdir -p ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org
rm -r ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org/*
cp -rf simple-dock@nothing.org/* ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org
# Activate extension
echo Gnome Shell will be restarted, ...
gnome-shell --replace &
