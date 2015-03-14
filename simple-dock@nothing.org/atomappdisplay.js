// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
/*jshint esnext: true */
/*jshint indent: 4 */
const Lang = imports.lang;
const Signals = imports.signals;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const AppDisplay = imports.ui.appDisplay;
const AppFavorites = imports.ui.appFavorites;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

let ShellVersion = imports.misc.config.PACKAGE_VERSION.split(".").map(function (x) { return +x; });
const MAJOR_VERSION = ShellVersion[0];
const MINOR_VERSION = ShellVersion[1];

/* This class is a extension of the upstream AppIcon class (ui.appDisplay.js).
 * Changes are done to modify activate, popup menu and running app behavior.
 */
const AtomAppIcon = new Lang.Class({
    Name: 'AtomAppIcon',
    Extends: AppDisplay.AppIcon,

    _init : function(app, iconParams) {
        this.parent(app, iconParams, { setSizeManually: true, showLabel: false });
        this._windowsChangedId = this.app.connect('windows-changed', Lang.bind(this, this._onStateChanged));

        this.actor.set_style("padding: 0px;");
    },

    activate: function (button) {

        let event = Clutter.get_current_event();
        let modifiers = event ? event.get_state() : 0;
        let openNewWindow = modifiers & Clutter.ModifierType.CONTROL_MASK &&
                            this.app.state == Shell.AppState.RUNNING ||
                            button && button == 2;
        let focusedApp = Shell.WindowTracker.get_default().focus_app;
        let windows = this.getAppInterestingWindows(this.app);

        if (openNewWindow) {
            this.app.open_new_window(-1);
        } else {
            if (this.app == focusedApp && !Main.overview._shown) {
                this.minimizeWindow(windows);
            } else {
                this.app.activate();
                if(windows.length>0) {
                    for (let i=windows.length-1; i>=0; i--){
                        Main.activateWindow(windows[i]);
                    }
                }
            }
        }

        Main.overview.hide();
    },

    minimizeWindow: function (windows){
        let current_workspace = global.screen.get_active_workspace();
        for (let i = 0; i < windows.length; i++) {
            let w = windows[i];
            if (w.get_workspace() == current_workspace && w.showing_on_its_workspace()){
                w.minimize();
            }
        }
    },

    getAppInterestingWindows: function(app) {
        // Filter out unnecessary windows, for instance
        // nautilus desktop window.
        let windows = app.get_windows().filter(function(w) {
            return !w.skip_taskbar;
        });

        return windows;
    },

    _onStateChanged: function() {
        if (this.app.state !== Shell.AppState.STOPPED && this._isAppOnActiveWorkspace()) {
            this.actor.add_style_class_name('running');
        } else {
            this.actor.remove_style_class_name('running');
        }
    },

    _onDestroy: function() {
        if (this._windowsChangedId > 0) {
            this.app.disconnect(this._windowsChangedId);
        }

        this._windowsChangedId = 0;
        this.parent();
    },

    popupMenu: function() {
        this._removeMenuTimeout();
        this.actor.fake_release();
        this._draggable.fakeRelease();

        if (!this._menu) {
            this._menu = new AtomAppIconMenu(this);

            this._menu.connect('activate-window', Lang.bind(this, function (menu, window) {
                    this.activateWindow(window);
                })
            );

            this._menu.connect('open-state-changed', Lang.bind(this, function (menu, isPoppedUp) {
                    if (!isPoppedUp) {
                        this._onMenuPoppedDown();
                    }
                })
            );

            Main.overview.connect('hiding', Lang.bind(this, this._menu.close));

            this._menuManager.addMenu(this._menu);
        }

        this.emit('menu-state-changed', true);
        this.actor.set_hover(true);
        this._menu.popup();
        this._menuManager.ignoreRelease();
        this.emit('sync-tooltip');

        return false;
    },

    _isAppOnActiveWorkspace: function() {
        return this.app.is_on_workspace(global.screen.get_active_workspace());
    }
});

Signals.addSignalMethods(AtomAppIcon.prototype);

/* This class is a fork of the upstream AppIconMenu class (ui.appDisplay.js).
 * Changes are done to make popup displayed on top side.
 */
const AtomAppIconMenu = new Lang.Class({
    Name: 'AtomAppIconMenu',
    Extends: PopupMenu.PopupMenu,

    _init: function(source) {
        this.parent(source.actor, 0.5, St.Side.TOP);

        // We want to keep the item hovered while the menu is up
        this.blockSourceEvents = true;
        this._source = source;
        this.connect('activate', Lang.bind(this, this._onActivate));
        this.actor.add_style_class_name('app-well-menu');

        // Chain our visibility and lifecycle to that of the source
        source.actor.connect('notify::mapped',
            Lang.bind(this, function() {
                if (!source.actor.mapped) {
                    this.close();
                }
            })
        );

        source.actor.connect('destroy', Lang.bind(this, this.actor.destroy));

        Main.uiGroup.add_actor(this.actor);
    },

    _redisplay: function() {
        this.removeAll();

        // Get interesting windows
        let windows = this._source.app.get_windows().filter(function(w) {
            if (MAJOR_VERSION === 3 && MINOR_VERSION <= 10) {
                return Shell.WindowTracker.is_window_interesting(w);
            } else {
                return !w.skip_taskbar;
            }
        });

        // Display the app windows menu items and the separator between windows
        // of the current desktop and other windows.
        let activeWorkspace = global.screen.get_active_workspace();
        let separatorShown = windows.length > 0 &&
            windows[0].get_workspace() !== activeWorkspace;

        for (let i = 0; i < windows.length; i++) {
            if (!separatorShown &&
                windows[i].get_workspace() !== activeWorkspace) {

                this._appendSeparator();
                separatorShown = true;
            }

            let item = this._appendMenuItem(windows[i].title);
            item._window = windows[i];
        }

        if (!this._source.app.is_window_backed()) {
        
            if (windows.length > 0) {
                this._appendSeparator();
            }

            let isFavorite = AppFavorites.getAppFavorites().isFavorite(this._source.app.get_id());
            this._newWindowMenuItem = this._appendMenuItem(_("New Window"));
            this._appendSeparator();
            this._toggleFavoriteMenuItem = this._appendMenuItem(isFavorite ? _("Remove from Favorites")
                                                                : _("Add to Favorites"));
        }
    },

    _appendSeparator: function () {
        let separator = new PopupMenu.PopupSeparatorMenuItem();
        this.addMenuItem(separator);
    },

    _appendMenuItem: function(labelText) {
        let item = new PopupMenu.PopupMenuItem(labelText);
        this.addMenuItem(item);

        return item;
    },

    popup: function(activatingButton) {
        this._redisplay();
        this.open();
    },

    _onActivate: function (actor, child) {
        if (child._window) {
            let metaWindow = child._window;
            this.emit('activate-window', metaWindow);
        } else if (child === this._newWindowMenuItem) {
            this._source.app.open_new_window(-1);
            this.emit('activate-window', null);
        } else if (child === this._toggleFavoriteMenuItem) {
            let favs = AppFavorites.getAppFavorites();
            let isFavorite = favs.isFavorite(this._source.app.get_id());

            if (isFavorite) {
                favs.removeFavorite(this._source.app.get_id());
            } else {
                favs.addFavorite(this._source.app.get_id());
            }

        }

        this.close();
    }
});

Signals.addSignalMethods(AtomAppIconMenu.prototype);
