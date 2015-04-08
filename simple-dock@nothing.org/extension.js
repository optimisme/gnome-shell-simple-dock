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

let oldDash;
let atomDock;
let intellihide;
let settings = null;
let settingsIconSignal = null;
let settingsBackgroundSignal = null;

// Settings
const SETTINGS_MAX_ICON_SIZE = "max-icon-size";
const SETTINGS_BACKGROUND_OPACITY = "background-opacity";

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

    settingsIconSignal = settings.connect("changed::" + SETTINGS_MAX_ICON_SIZE,
        function() { settingsIconChanged(); });

    settingsBackgroundSignal = settings.connect("changed::" + SETTINGS_BACKGROUND_OPACITY,
        function() { settingsBackgroundChanged(); });
}

function disable() {

    intellihide.destroy();
    atomDock.destroy();
    oldDash.showDash();

    if(settingsIconSignal != null) {
        settings.disconnect(settingsIconSignal);
        settingsIconSignal = null;
    }

    if(settingsBackgroundSignal != null) {
        settings.disconnect(settingsBackgroundSignal);
        settingsBackgroundSignal = null;
    }
}
