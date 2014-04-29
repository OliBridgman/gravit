(function (_) {
    var gui = require('nw.gui');

    /**
     * The desktop shell
     * @class GDesktopShell
     * @extends GShell
     * @constructor
     */
    function GDesktopShell() {
        this._menuBar = new gui.Menu({ 'type': 'menubar' });
    }

    GObject.inherit(GDesktopShell, GShell);

    /**
     * @type {nw.gui.Menu}
     * @private
     */
    GDesktopShell.prototype._menuBar = null;

    /** @override */
    GDesktopShell.prototype.prepareLoad = function () {
        // ...
    };

    /** @override */
    GDesktopShell.prototype.finishLoad = function () {
        initWindowState();
        var win = gui.Window.get();
        win.menu = this._menuBar;
        win.focus();
    };

    /** @override */
    GDesktopShell.prototype.addMenu = function (parentMenu, title, callback) {
        parentMenu = parentMenu || this._menuBar;
        var item = new gui.MenuItem({
            label: title
        });

        var menu = new gui.Menu({
            type: 'contextmenu',
            update: callback
        });
        item.submenu = menu;

        parentMenu.append(item);

        return menu;
    };

    /** @override */
    GDesktopShell.prototype.addMenuSeparator = function (parentMenu) {
        var item = new gui.MenuItem({
            type: 'separator'
        });
        parentMenu.append(item);
        return item;
    };

    /** @override */
    GDesktopShell.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
        var item = new gui.MenuItem({
            type: checkable ? 'checkbox' : 'normal',
            click: callback,
            label: title,
            shortcut: shortcut ? this._shortcutToShellShortcut(shortcut) : null
        });
        parentMenu.append(item);
        return item;
    };

    /** @override */
    GDesktopShell.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.label = title;
        item.enabled = enabled;

        if (item.type === 'checkbox') {
            item.checked = checked;
        }
    };

    /** @override */
    GDesktopShell.prototype.removeMenuItem = function (parentMenu, child) {
        parentMenu.remove(child);
    };

    /** @override */
    GDesktopShell.prototype.getClipboardMimeTypes = function () {
        //return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GDesktopShell.prototype.getClipboardContent = function (mimeType) {
        /*
         if (this._clipboardMimeTypes && this._clipboardMimeTypes.hasOwnProperty(mimeType)) {
         return this._clipboardMimeTypes[mimeType];
         }
         */
        return null;
    };

    /** @override */
    GDesktopShell.prototype.setClipboardContent = function (mimeType, content) {
        //this._clipboardMimeTypes[mimeType] = content;
    };

    /**
     * Convert internal key into a shell-compatible key
     * @param {Array<*>} shortcut
     * @returns {String}
     */
    GDesktopShell.prototype._shortcutToShellShortcut = function (shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                result += "+";
            }

            var key = shortcut[i];

            if (typeof key == 'number') {
                // we want a system-translated key here
                var key = guiKey.transformKey(key);

                switch (key) {
                    case GUIKey.Constant.SPACE:
                        result += "space";
                        break;
                    case GUIKey.Constant.ENTER:
                        result += "enter";
                        break;
                    case GUIKey.Constant.TAB:
                        result += "tab";
                        break;
                    case GUIKey.Constant.BACKSPACE:
                        result += "backspace";
                        break;
                    case GUIKey.Constant.CONTROL:
                        result += "ctrl";
                        break;
                    case GUIKey.Constant.SHIFT:
                        result += "shift";
                        break;
                    case GUIKey.Constant.ALT:
                        result += "alt";
                        break;
                    case GUIKey.Constant.LEFT:
                        result += "left";
                        break;
                    case GUIKey.Constant.UP:
                        result += "up";
                        break;
                    case GUIKey.Constant.RIGHT:
                        result += "right";
                        break;
                    case GUIKey.Constant.DOWN:
                        result += "down";
                        break;
                    case GUIKey.Constant.PAGE_UP:
                        result += "pageup";
                        break;
                    case GUIKey.Constant.PAGE_DOWN:
                        result += "pagedown";
                        break;
                    case GUIKey.Constant.HOME:
                        result += "home";
                        break;
                    case GUIKey.Constant.END:
                        result += "end";
                        break;
                    case GUIKey.Constant.INSERT:
                        result += "ins";
                        break;
                    case GUIKey.Constant.DELETE:
                        result += "del";
                        break;
                    case GUIKey.Constant.ESCAPE:
                        result += "esc";
                        break;
                    case GUIKey.Constant.COMMAND:
                        result += "cmd";
                        break;
                    case GUIKey.Constant.F1:
                        result += "f1";
                        break;
                    case GUIKey.Constant.F2:
                        result += "f2";
                        break;
                    case GUIKey.Constant.F3:
                        result += "f3";
                        break;
                    case GUIKey.Constant.F4:
                        result += "f4";
                        break;
                    case GUIKey.Constant.F5:
                        result += "f5";
                        break;
                    case GUIKey.Constant.F6:
                        result += "f6";
                        break;
                    case GUIKey.Constant.F7:
                        result += "f7";
                        break;
                    case GUIKey.Constant.F8:
                        result += "f8";
                        break;
                    case GUIKey.Constant.F9:
                        result += "f9";
                        break;
                    case GUIKey.Constant.F10:
                        result += "f10";
                        break;
                    case GUIKey.Constant.F11:
                        result += "f11";
                        break;
                    case GUIKey.Constant.F12:
                        result += "f12";
                        break;
                    default:
                        throw new Error("Unknown key code");
                }
            } else {
                result += key.toLowerCase();
            }
        }
        return result;
    };

    _.gShell = new GDesktopShell;
})(this);
