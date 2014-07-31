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
                        // TODO
                        break;
                    case IFKey.Constant.UP:
                        // TODO
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF700);
                        } else {
                            result.key = "UP";
                        }
                        break;
                    case IFKey.Constant.RIGHT:
                        // TODO
                        break;
                    case IFKey.Constant.DOWN:
                        // TODO
                        break;
                    case IFKey.Constant.PAGE_UP:
                        // TODO
                        break;
                    case IFKey.Constant.PAGE_DOWN:
                        // TODO
                        break;
                    case IFKey.Constant.HOME:
                        // TODO
                        break;
                    case IFKey.Constant.END:
                        // TODO
                        break;
                    case IFKey.Constant.INSERT:
                        // TODO
                        break;
                    case IFKey.Constant.DELETE:
                        // TODO
                        result.key = String.fromCharCode(0x7F);
                        break;
                    case IFKey.Constant.ESCAPE:
                        // TODO
                        break;
                    case IFKey.Constant.F1:
                        // TODO
                        break;
                    case IFKey.Constant.F2:
                        // TODO
                        break;
                    case IFKey.Constant.F3:
                        // TODO
                        break;
                    case IFKey.Constant.F4:
                        // TODO
                        break;
                    case IFKey.Constant.F5:
                        // TODO
                        break;
                    case IFKey.Constant.F6:
                        // TODO
                        break;
                    case IFKey.Constant.F7:
                        // TODO
                        break;
                    case IFKey.Constant.F8:
                        // TODO
                        break;
                    case IFKey.Constant.F9:
                        // TODO
                        break;
                    case IFKey.Constant.F10:
                        // TODO
                        break;
                    case IFKey.Constant.F11:
                        // TODO
                        break;
                    case IFKey.Constant.F12:
                        // TODO
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
