(function (_) {
    var gui = require('nw.gui');

    /**
     * The desktop shell
     * @class GDesktopShell
     * @extends GShell
     * @constructor
     */
    function GDesktopShell() {
        this._menuBar = new gui.Menu({ type: "menubar" });

        if (process.platform === 'darwin') {
            this._menuBar.createMacBuiltin("Gravit", {
                hideEdit: true,
                hideWindow: true
            });
        }

        this._clipboardMimeTypes = {};
    };
    IFObject.inherit(GDesktopShell, GShell);

    /**
     * @type {gui.Menu}
     * @private
     */
    GDesktopShell.prototype._menuBar = null;

    /**
     * @type {*}
     * @private
     */
    GDesktopShell.prototype._clipboardMimeTypes = null;

    /** @override */
    GDesktopShell.prototype.isDevelopment = function () {
        var argv = gui.App.argv;
        return argv.indexOf('-dev') >= 0;
    };

    /** @override */
    GDesktopShell.prototype.prepareLoad = function () {
        // Init shell-specific stuff here
        gravit.storages.push(new GNativeStorage());
    };

    /** @override */
    GDesktopShell.prototype.finishLoad = function () {
        initWindowState();
        var win = gui.Window.get();
        win.menu = this._menuBar;

        // Open dev console if desired
        var argv = gui.App.argv;
        if (this.isDevelopment() || argv.indexOf('-console') >= 0) {
            win.showDevTools();
        }

        // Focus window
        win.focus();
    };

    /** @override */
    GDesktopShell.prototype.addMenu = function (parentMenu, title, callback) {
        parentMenu = parentMenu || this._menuBar;
        var item = new gui.MenuItem({
            label: title,
            submenu: new gui.Menu()
        });
        parentMenu.append(item);

        //if (callback) {
        //    item.getMenu().addEventListener(GUIMenu.OpenEvent, callback);
        //}

        return item.submenu;
    };

    /** @override */
    GDesktopShell.prototype.addMenuSeparator = function (parentMenu) {
        var item = new gui.MenuItem({ type: 'separator' });
        parentMenu.append(item);
        return item;
    };

    /** @override */
    GDesktopShell.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
        var shortcut = shortcut ? this._shortcutToShellShortcut(shortcut) : null;

        var item = new gui.MenuItem({
            type: checkable ? 'checkbox' : 'normal',
            label: title,
            key: shortcut ? shortcut.key : null,
            modifiers: shortcut ? shortcut.modifiers : null,
            click: callback
        });

        parentMenu.append(item);
        return item;
    };

    /** @override */
    GDesktopShell.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.label = title;
        item.enabled = enabled;
        item.checked = checked;
    };

    /** @override */
    GDesktopShell.prototype.removeMenuItem = function (parentMenu, child) {
        parentMenu.remove(child);
    };

    /** @override */
    GDesktopShell.prototype.getClipboardMimeTypes = function () {
        return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GDesktopShell.prototype.getClipboardContent = function (mimeType) {
        if (this._clipboardMimeTypes && this._clipboardMimeTypes.hasOwnProperty(mimeType)) {
            return this._clipboardMimeTypes[mimeType];
        }
        return null;
    };

    /** @override */
    GDesktopShell.prototype.setClipboardContent = function (mimeType, content) {
        this._clipboardMimeTypes[mimeType] = content;
    };

    /**
     * Convert internal key into a shell-compatible key
     * @param {Array<*>} shortcut
     * @returns {{key: String, modifiers: String}}
     */
    GDesktopShell.prototype._shortcutToShellShortcut = function (shortcut) {
        var result = {
            key: null,
            modifiers: ''
        };

        for (var i = 0; i < shortcut.length; ++i) {
            var key = shortcut[i];

            if (typeof key == 'number') {
                // we want a system-translated key here
                var key = ifKey.transformKey(key);
                switch (key) {
                    // Modifiers
                    case IFKey.Constant.CONTROL:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'ctrl';
                        break;
                    case IFKey.Constant.SHIFT:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'shift';
                        break;
                    case IFKey.Constant.ALT:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'alt';
                        break;
                    case IFKey.Constant.COMMAND:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'cmd';
                        break;

                    // Regular Keys
                    case IFKey.Constant.SPACE:
                        // TODO
                        result.key = " ";
                        break;
                    case IFKey.Constant.ENTER:
                        // TODO
                        result.key = "\r";
                        break;
                    case IFKey.Constant.TAB:
                        // TODO
                        result.key = "\t";
                        break;
                    case IFKey.Constant.BACKSPACE:
                        // TODO
                        result.key = "\b";
                        break;

                    case IFKey.Constant.LEFT:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF702);
                        } else {
                            result.key = "LEFT";
                        }
                        break;
                    case IFKey.Constant.UP:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF700);
                        } else {
                            result.key = "UP";
                        }
                        break;
                    case IFKey.Constant.RIGHT:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF703);
                        } else {
                            result.key = "RIGHT";
                        }
                        break;
                    case IFKey.Constant.DOWN:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF701);
                        } else {
                            result.key = "DOWN";
                        }
                        break;
                    case IFKey.Constant.PAGE_UP:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF72C);
                        } else {
                            result.key = "PAGEUP";
                        }
                        break;
                    case IFKey.Constant.PAGE_DOWN:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF72D);
                        } else {
                            result.key = "PAGEDOWN";
                        }
                        break;
                    case IFKey.Constant.HOME:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF729);
                        } else {
                            result.key = "HOME";
                        }
                        break;
                    case IFKey.Constant.END:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF72B);
                        } else {
                            result.key = "END";
                        }
                        break;
                    case IFKey.Constant.INSERT:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF727);
                        } else {
                            result.key = "INSERT";
                        }
                        break;
                    case IFKey.Constant.DELETE:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF728);
                        } else {
                            result.key = "DELETE";
                        }
                        break;
                    case IFKey.Constant.F1:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF704);
                        } else {
                            result.key = "F1";
                        }
                        break;
                    case IFKey.Constant.F2:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF705);
                        } else {
                            result.key = "F2";
                        }
                        break;
                    case IFKey.Constant.F3:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF706);
                        } else {
                            result.key = "F3";
                        }
                        break;
                    case IFKey.Constant.F4:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF707);
                        } else {
                            result.key = "F4";
                        }
                        break;
                    case IFKey.Constant.F5:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF708);
                        } else {
                            result.key = "F5";
                        }
                        break;
                    case IFKey.Constant.F6:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF709);
                        } else {
                            result.key = "F6";
                        }
                        break;
                    case IFKey.Constant.F7:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70A);
                        } else {
                            result.key = "F7";
                        }
                        break;
                    case IFKey.Constant.F8:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70B);
                        } else {
                            result.key = "F8";
                        }
                        break;
                    case IFKey.Constant.F9:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70C);
                        } else {
                            result.key = "F9";
                        }
                        break;
                    case IFKey.Constant.F10:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70D);
                        } else {
                            result.key = "F10";
                        }
                        break;
                    case IFKey.Constant.F11:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70E);
                        } else {
                            result.key = "F11";
                        }
                        break;
                    case IFKey.Constant.F12:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70F);
                        } else {
                            result.key = "F12";
                        }
                        break;
                    default:
                        throw new Error("Unknown key code");
                }
            } else {
                result.key = key.toLowerCase();
            }
        }

        if (result.modifiers === '') {
            result.modifiers = null;
        }

        return result.key !== null ? result : null;
    };

    _.gShell = new GDesktopShell;
})(this);
