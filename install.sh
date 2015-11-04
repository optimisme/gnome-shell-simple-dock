#!/bin/bash

# Install extension
gnome-shell-extension-tool -d simple-dock@nothing.org
mkdir -p ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org
rm -r ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org/*
cp -rf simple-dock@nothing.org/* ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org

# Activate extension
gnome-shell-extension-tool -e simple-dock@nothing.org
echo "Restart Gnome Shell with 'Alt+F2' and then command 'r' + 'Intro'"

