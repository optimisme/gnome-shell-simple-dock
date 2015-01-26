const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();

const _ = imports.gettext.domain(Me.uuid).gettext;

const SETTINGS_CHANGE_MESSAGE_TRAY = "change-message-tray";
const SETTINGS_MAX_ICON_SIZE = "max-icon-size";
const SETTINGS_BACKGROUND_OPACITY = "background-opacity";

let settings;

function init() {
    imports.gettext.bindtextdomain(Me.uuid, Me.path + "/locale");
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

function buildPrefsWidget() {
    let frame = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 10
    });

    let vbox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin: 20,
        margin_top: 10
    });

    let hbox1 = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL
    });

    let settingLabel = new Gtk.Label({
        label: _("Adapt message bar and notifications"),
        xalign: 0
    });

    let settingSwitch = new Gtk.Switch({
        active: settings.get_boolean(SETTINGS_CHANGE_MESSAGE_TRAY)
    });
    settingSwitch.connect("notify::active", function(button) {
        settings.set_boolean(SETTINGS_CHANGE_MESSAGE_TRAY, button.active);
    });

    settingLabel.set_tooltip_text(_("Sets bottom message tray corners and moves notifications to the top bar"));
    settingSwitch.set_tooltip_text(_("Sets bottom message tray corners and moves notifications to the top bar"));

    hbox1.pack_start(settingLabel, true, true, 0);
    hbox1.add(settingSwitch);

    vbox.add(hbox1);

    let hbox3 = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
		margin_left:0, margin_top:10, margin_bottom:0, margin_right:0
    });

    let iconSizeLabel = new Gtk.Label({
        label: _("Maximum icon size"),
        xalign: 0
    });

    let allSizes  =[ 16, 24, 32, 48, 64, 96, 128 ];
    let settingIconCombo = new Gtk.ComboBoxText({halign:Gtk.Align.END});
    settingIconCombo.append_text(_("16"));
    settingIconCombo.append_text(_("24"));
    settingIconCombo.append_text(_("32"));
    settingIconCombo.append_text(_("48"));
    settingIconCombo.append_text(_("64"));
    settingIconCombo.append_text(_("96"));
    settingIconCombo.append_text(_("128"));
    settingIconCombo.set_active(allSizes.indexOf(settings.get_int(SETTINGS_MAX_ICON_SIZE)));
    settingIconCombo.connect("changed", function(widget) {
        settings.set_int(SETTINGS_MAX_ICON_SIZE, allSizes[widget.get_active()]);
    });

    iconSizeLabel.set_tooltip_text(_("Maximum icon size"));
    settingIconCombo.set_tooltip_text(_("Maximum icon size"));

    hbox3.pack_start(iconSizeLabel, true, true, 0);
    hbox3.add(settingIconCombo);

    vbox.add(hbox3);

    let hbox4 = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
		margin_left:0, margin_top:10, margin_bottom:0, margin_right:0
    });

    let opacityLabel = new Gtk.Label({
        label: _("Background opacity"),
        xalign: 0
    });

    opacityLabel.set_tooltip_text(_("Sets background opacity"));
    let opacitySlider =  new Gtk.Scale({orientation: Gtk.Orientation.HORIZONTAL, valuePos: Gtk.PositionType.RIGHT});
        opacitySlider.set_range(0, 100);
        opacitySlider.set_value(40);
        opacitySlider.set_digits(0);
        opacitySlider.set_increments(5,5);
        opacitySlider.set_size_request(150, -1);
        opacitySlider.connect("value-changed", function(widget) {
            settings.set_double(SETTINGS_BACKGROUND_OPACITY, widget.get_value()/100);
        });

    hbox4.pack_start(opacityLabel, true, true, 0);
    hbox4.add(opacitySlider);

    vbox.add(hbox4);

    frame.add(vbox);
    frame.show_all();
    return frame;
}
