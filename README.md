gnome-shell-simple-dock
=======================

Bottom dock for gnome shell

Featuring:

- Intelligent auto hide.
- Minimize focused application.
- Drag and drop favorites.
- Disable message tray (Optional).
- Top bar message tray button (if disabled).
- Move notifications to top (Optional).
- Adjust icon sizes (Optional)

INSTALLATION
------------

With 'Firefox' or 'Gnome Web' from 'Gnome shell extensions webtool':

https://extensions.gnome.org/extension/815/simple-dock/

Manually:

    cd ~
    git clone https://github.com/optimisme/gnome-shell-simple-dock.git
    cd gnome-shell-simple-dock
    mkdir ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org
    cp simple-dock@nothing.org ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org
    cd ../
    rm -rf gnome-shell-simple-dock

Then, open the 'shell command dialog' by pressing 'Alt-F2' (or 'Fn-Alt-F2' on Mac), type 'r' and press enter to reload 'Gnome shell'

CUSTOMIZATION
------------

Using 'Tweak tool' (can be installed from 'Software'), the extension can be customized or disabled.

UNINSTALLATION
------------

To uninstall this extension, remove the folder where the extension is installed:

    rm -rf ~/.local/share/gnome-shell/extensions/simple-dock@nothing.org


