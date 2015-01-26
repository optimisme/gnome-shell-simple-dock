/* Mixture of:
 *
 * Ozon OS Dock
 * Panel OSD
 * Disable message tray
 */

const St = imports.gi.St;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;
const LayoutManager = Main.layoutManager;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;
const GnomeDash = Me.imports.gnomedash;
const Intellihide = Me.imports.intellihide;
const AtomDock = Me.imports.atomdock;
const ModifiedMessageTray = Me.imports.messageTrayModified;

let oldDash;
let atomDock;
let intellihide;
let modifiedMessageTray;
let settings = null;
let settingsTraySignal = null;
let settingsIconSignal = null;
let settingsBackgroundSignal = null;

// Settings
const SETTINGS_CHANGE_MESSAGE_TRAY = "change-message-tray";
const SETTINGS_MAX_ICON_SIZE = "max-icon-size";
const SETTINGS_BACKGROUND_OPACITY = "background-opacity";

function setSettingsNotifications() {
    if (settings.get_boolean(SETTINGS_CHANGE_MESSAGE_TRAY)) {
        modifiedMessageTray.enable(true);
    } else {
        modifiedMessageTray.disable(true);
    }
}

function settingsIconChanged() {
    atomDock.setMaxIconSize(settings.get_int(SETTINGS_MAX_ICON_SIZE), true);
}

function settingsBackgroundChanged() {
    atomDock.setBackgroundOpacity(settings.get_double(SETTINGS_BACKGROUND_OPACITY), true);
}

// Init settings
function initSettings() {
    const GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(Me.path + "/schemas", 
            GioSSS.get_default(), false);

    let schemaObj = schemaSource.lookup(Me.metadata["settings-schema"], true);
    if(!schemaObj) {
        throw new Error("Schema " + Me.metadata["settings-schema"] + " could not be found for extension " +
                        Me.uuid + ". Please check your installation.");
    }
    settings = new Gio.Settings({ settings_schema: schemaObj });
}

function init() {
    oldDash = new GnomeDash.GnomeDash();
    initSettings();
}

function show() {
    atomDock.intelliShow();
}

function hide() {
    atomDock.intelliHide();
}

function retop() {
    atomDock.retop();
}

function enable() {
    // Hide old dash
    oldDash.hideDash();

    // Enable new dock
    atomDock = new AtomDock.AtomDock();
    let iconSize = settings.get_int(SETTINGS_MAX_ICON_SIZE);
    if (iconSize) {
        atomDock.setMaxIconSize(iconSize, false);
    } else {
        atomDock.setMaxIconSize(48, false);
    }

	let backOpacity = settings.get_double(SETTINGS_BACKGROUND_OPACITY);
    atomDock.setBackgroundOpacity(backOpacity, true);

    intellihide = new Intellihide.Intellihide(show, hide, retop, atomDock);

    modifiedMessageTray = new ModifiedMessageTray.ModifiedMessageTray(settings.get_boolean(SETTINGS_CHANGE_MESSAGE_TRAY));

    settingsTraySignal = settings.connect("changed::" + SETTINGS_CHANGE_MESSAGE_TRAY,
        function() { setSettingsNotifications(); });

    settingsIconSignal = settings.connect("changed::" + SETTINGS_MAX_ICON_SIZE,
        function() { settingsIconChanged(); });

    settingsBackgroundSignal = settings.connect("changed::" + SETTINGS_BACKGROUND_OPACITY,
        function() { settingsBackgroundChanged(); });
}

function disable() {

    intellihide.destroy();
    atomDock.destroy();
    oldDash.showDash();
	modifiedMessageTray.destroy();

    if(settingsTraySignal != null) {
        settings.disconnect(settingsTraySignal);
        settingsTraySignal = null;
    }

    if(settingsIconSignal != null) {
        settings.disconnect(settingsIconSignal);
        settingsIconSignal = null;
    }

    if(settingsBackgroundSignal != null) {
        settings.disconnect(settingsBackgroundSignal);
        settingsBackgroundSignal = null;
    }
}
