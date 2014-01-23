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
        // NO-OP
    };

    /** @override */
    GNativeShell.prototype.finishLoad = function () {
        gHost.openShell();
    };

    /** @override */
    GNativeShell.prototype.createMenuBar = function (menu) {
        var _updateShellMenu = function (menu, mappings) {
            menu.update();
            for (var i = 0; i < mappings.length; ++i) {
                var mapping = mappings[i];
                mapping.shellItem.text = gLocale.get(mapping.item.getCaption());
                if (mapping.item.isChecked()) {
                    mapping.shellItem.checkable = true;
                    mapping.shellItem.checked = true;
                } else {
                    mapping.shellItem.checked = false;
                }
                mapping.shellItem.enabled = mapping.item.isEnabled();
            }
        };

        var _addShellMenuItem = function (shellMenu, menuItem) {
            var shellItem = gHost.addMenuItem(shellMenu, menuItem.getShortcutHint() ? _shortcutToHostShortcut(menuItem.getShortcutHint()) : "");
            shellItem.triggered.connect(function () {
                gApp.executeAction(menuItem.getAction().getId());
            });
            return shellItem;
        };

        var _addShellMenu = function (shellParentMenu, menuItem) {
            var menu = menuItem.getMenu();
            var shellMappings = [];
            var shellMenu = gHost.addMenu(shellParentMenu, gLocale.get(menuItem.getCaption()));
            shellMenu.aboutToShow.connect(function () {
                _updateShellMenu(menu, shellMappings);
            });

            for (var i = 0; i < menu.getItemCount(); ++i) {
                var item = menu.getItem(i);
                switch (item.getType()) {
                    case GUIMenuItem.Type.Menu:
                        _addShellMenu(shellMenu, item);
                        break;
                    case GUIMenuItem.Type.Item:
                        shellMappings.push({
                            item: item,
                            shellItem: _addShellMenuItem(shellMenu, item)
                        });
                        break;
                    case GUIMenuItem.Type.Divider:
                        gHost.addMenuSeparator(shellMenu);
                        break;
                }
            }
        };

        for (var i = 0; i < menu.getItemCount(); ++i) {
            _addShellMenu(null, menu.getItem(i));
        }
    };

    _.gShell = new GNativeShell;

    /**
     * Convert internal key into a host-compatible key
     * @param {Array<*>} shortcut
     * @returns {String}
     */
    function _shortcutToHostShortcut (shortcut) {
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
