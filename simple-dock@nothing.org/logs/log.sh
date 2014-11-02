#!/bin/bash

# Call: imports.misc.util.spawnCommandLine('/home/optimisme/.local/share/gnome-shell/extensions/simple-dock@nothing.org/logs/log.sh si');
# Logs: tail -f ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org/logs/log.tmp
echo $1 >> ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org/logs/log.tmp

