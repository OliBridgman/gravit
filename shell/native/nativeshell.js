(function (_) {
    /**
     * The native shell
     * @class GNativeShell
     * @extends GShell
     * @constructor
     */
    function GNativeShell() {
    };
    GObject.inherit(GNativeShell, GShell);

    /** @override */
    GNativeShell.prototype.prepareLoad = function () {
        // Register our native storage
        gravit.storages.push(new GNativeStorage());
    };

    /** @override */
    GNativeShell.prototype.finishLoad = function () {
        gHost.openShell();
    };

    /** @override */
    GNativeShell.prototype.addMenu = function (parentMenu, title, callback) {
        var menu = gHost.addMenu(parentMenu, title);
        if (callback) {
            menu.aboutToShow.connect(function () {
                //alert('UPDATEMENU');
                callback();
            });
        }
        return menu;
    };

    /** @override */
    GNativeShell.prototype.addMenuSeparator = function (parentMenu) {
        return gHost.addMenuSeparator(parentMenu);
    };

    /** @override */
    GNativeShell.prototype.addMenuItem = function (parentMenu, callback) {
        var item = gHost.addMenuItem(parentMenu);

        if (callback) {
            item.triggered.connect(function () {
                callback();
            });
        }

        return item;
    };

    /** @override */
    GNativeShell.prototype.updateMenuItem = function (item, title, enabled, checked, shortcut) {
        item.text = title;

        if (checked) {
            item.checkable = true;
            item.checked = true;
        } else {
            item.checkable = false;
            item.checked = false;
        }

        item.enabled = enabled;

        gHost.updateMenuItemShortcut(item, shortcut ? _shortcutToHostShortcut(shortcut) : "");
    };

    /** @override */
    GNativeShell.prototype.removeMenuItem = function (parentMenu, child) {
        gHost.removeMenuItem(parentMenu, child);
    };

    _.gShell = new GNativeShell;

    /**
     * Convert internal key into a host-compatible key
     * @param {Array<*>} shortcut
     * @returns {String}
     */
    function _shortcutToHostShortcut(shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                result += "+";
            }

            var key = shortcut[i];
            if (typeof key == 'number') {
                switch (key) {
                    case GUIKey.Constant.META:
                        result += "Ctrl";
                        break;
                    case GUIKey.Constant.OPTION:
                        result += "Alt";
                        break;
                    case GUIKey.Constant.REMOVE:
                        result += "Del";
                        break;
                    case GUIKey.Constant.SPACE:
                        result += "Space";
                        break;
                    case GUIKey.Constant.ENTER:
                        result += "Enter";
                        break;
                    case GUIKey.Constant.TAB:
                        result += "Tab";
                        break;
                    case GUIKey.Constant.BACKSPACE:
                        result += "Backspace";
                        break;
                    case GUIKey.Constant.CONTROL:
                        result += "Ctrl";
                        break;
                    case GUIKey.Constant.SHIFT:
                        result += "Shift";
                        break;
                    case GUIKey.Constant.ALT:
                        result += "Alt";
                        break;
                    case GUIKey.Constant.LEFT:
                        result += "Left";
                        break;
                    case GUIKey.Constant.UP:
                        result += "Up";
                        break;
                    case GUIKey.Constant.RIGHT:
                        result += "Right";
                        break;
                    case GUIKey.Constant.DOWN:
                        result += "Down";
                        break;
                    case GUIKey.Constant.PAGE_UP:
                        result += "PgUp";
                        break;
                    case GUIKey.Constant.PAGE_DOWN:
                        result += "PgDown";
                        break;
                    case GUIKey.Constant.HOME:
                        result += "Home";
                        break;
                    case GUIKey.Constant.END:
                        result += "End";
                        break;
                    case GUIKey.Constant.INSERT:
                        result += "Ins";
                        break;
                    case GUIKey.Constant.DELETE:
                        result += "Del";
                        break;
                    case GUIKey.Constant.ESCAPE:
                        result += "Esc";
                        break;
                    case GUIKey.Constant.COMMAND:
                        result += "Ctrl";
                        break;
                    case GUIKey.Constant.F1:
                        result += "F1";
                        break;
                    case GUIKey.Constant.F2:
                        result += "F2";
                        break;
                    case GUIKey.Constant.F3:
                        result += "F3";
                        break;
                    case GUIKey.Constant.F4:
                        result += "F4";
                        break;
                    case GUIKey.Constant.F5:
                        result += "F5";
                        break;
                    case GUIKey.Constant.F6:
                        result += "F6";
                        break;
                    case GUIKey.Constant.F7:
                        result += "F7";
                        break;
                    case GUIKey.Constant.F8:
                        result += "F8";
                        break;
                    case GUIKey.Constant.F9:
                        result += "F9";
                        break;
                    case GUIKey.Constant.F10:
                        result += "F10";
                        break;
                    case GUIKey.Constant.F11:
                        result += "F11";
                        break;
                    case GUIKey.Constant.F12:
                        result += "F12";
                        break;
                    default:
                        throw new Error("Unknown key code");
                }
            } else {
                result += key.toUpperCase();
            }
        }
        return result;
    };
})(this);
