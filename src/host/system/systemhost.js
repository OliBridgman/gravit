(function (_) {
    var gui = require('nw.gui');

    gui.App.on('open', function (cmdline) {
        if (cmdline && cmdline.length > 0) {
            gApp.openDocument('file://' + cmdline);
        }
    });

    process.on("uncaughtException", function (e) {
        console.log(e);
        vex.dialog.alert({ message: 'Sorry but an error has occurred. Please save your existing work and restart the application.' });
    });

    /**
     * The system shell
     * @class GSystemHost
     * @extends GHost
     * @constructor
     */
    function GSystemHost() {
        this._menuBar = new gui.Menu({type: "menubar"});

        if (process.platform === 'darwin') {
            this._menuBar.createMacBuiltin("Gravit", {
                hideEdit: true,
                hideWindow: true
            });
        }

        this._clipboardMimeTypes = {};
    };
    GObject.inherit(GSystemHost, GHost);

    /**
     * @type {gui.Menu}
     * @private
     */
    GSystemHost.prototype._menuBar = null;

    /**
     * @type {*}
     * @private
     */
    GSystemHost.prototype._clipboardMimeTypes = null;

    /** @override */
    GSystemHost.prototype.isDevelopment = function () {
        var argv = gui.App.argv;
        return argv.indexOf('-dev') >= 0;
    };

    /** @override */
    GSystemHost.prototype.start = function () {
        var win = gui.Window.get();
        win.menu = _.gShell._menuBar;
        win.show();
        win.focus();

        var hasOpenedDocuments = false;
        var argv = gui.App.argv;
        if (argv && argv.length) {
            for (var i = 0; i < argv.length; ++i) {
                if (argv[i].charAt(0) !== '-') {
                    gApp.openDocument('file://' + argv[i]);
                    hasOpenedDocuments = true;
                }
            }
        }

        if (!hasOpenedDocuments) {
            GHost.prototype.start.call(this);
        }
    };

    /** @override */
    GSystemHost.prototype.addMenu = function (parentMenu, title, callback) {
        parentMenu = parentMenu || this._menuBar;
        var item = new gui.MenuItem({
            label: title,
            submenu: new gui.Menu()
        });
        parentMenu.append(item);

        //if (callback) {
        //    item.getMenu().addEventListener(GMenu.OpenEvent, callback);
        //}

        return item.submenu;
    };

    /** @override */
    GSystemHost.prototype.addMenuSeparator = function (parentMenu) {
        var item = new gui.MenuItem({type: 'separator'});
        parentMenu.append(item);
        return item;
    };

    /** @override */
    GSystemHost.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
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
    GSystemHost.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.label = title;
        item.enabled = enabled;
        item.checked = checked;
    };

    /** @override */
    GSystemHost.prototype.removeMenuItem = function (parentMenu, child) {
        parentMenu.remove(child);
    };

    /** @override */
    GSystemHost.prototype.getClipboardMimeTypes = function () {
        return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GSystemHost.prototype.getClipboardContent = function (mimeType) {
        if (this._clipboardMimeTypes && this._clipboardMimeTypes.hasOwnProperty(mimeType)) {
            return this._clipboardMimeTypes[mimeType];
        }
        return null;
    };

    /** @override */
    GSystemHost.prototype.setClipboardContent = function (mimeType, content) {
        this._clipboardMimeTypes[mimeType] = content;
    };

    /**
     * Convert internal key into a shell-compatible key
     * @param {Array<*>} shortcut
     * @returns {{key: String, modifiers: String}}
     */
    GSystemHost.prototype._shortcutToShellShortcut = function (shortcut) {
        var result = {
            key: null,
            modifiers: ''
        };

        for (var i = 0; i < shortcut.length; ++i) {
            var key = shortcut[i];

            if (typeof key == 'number') {
                // we want a system-translated key here
                var key = GKey.transformKey(key);
                switch (key) {
                    // Modifiers
                    case GKey.Constant.CONTROL:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'ctrl';
                        break;
                    case GKey.Constant.SHIFT:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'shift';
                        break;
                    case GKey.Constant.ALT:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'alt';
                        break;
                    case GKey.Constant.COMMAND:
                        result.modifiers = result.modifiers + (result.modifiers ? '-' : '') + 'cmd';
                        break;

                    // Regular Keys
                    case GKey.Constant.SPACE:
                        // TODO
                        result.key = " ";
                        break;
                    case GKey.Constant.ENTER:
                        // TODO
                        result.key = "\r";
                        break;
                    case GKey.Constant.TAB:
                        // TODO
                        result.key = "\t";
                        break;
                    case GKey.Constant.BACKSPACE:
                        // TODO
                        result.key = "\b";
                        break;

                    case GKey.Constant.LEFT:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF702);
                        } else {
                            result.key = "LEFT";
                        }
                        break;
                    case GKey.Constant.UP:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF700);
                        } else {
                            result.key = "UP";
                        }
                        break;
                    case GKey.Constant.RIGHT:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF703);
                        } else {
                            result.key = "RIGHT";
                        }
                        break;
                    case GKey.Constant.DOWN:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF701);
                        } else {
                            result.key = "DOWN";
                        }
                        break;
                    case GKey.Constant.PAGE_UP:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF72C);
                        } else {
                            result.key = "PAGEUP";
                        }
                        break;
                    case GKey.Constant.PAGE_DOWN:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF72D);
                        } else {
                            result.key = "PAGEDOWN";
                        }
                        break;
                    case GKey.Constant.HOME:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF729);
                        } else {
                            result.key = "HOME";
                        }
                        break;
                    case GKey.Constant.END:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF72B);
                        } else {
                            result.key = "END";
                        }
                        break;
                    case GKey.Constant.INSERT:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF727);
                        } else {
                            result.key = "INSERT";
                        }
                        break;
                    case GKey.Constant.DELETE:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF728);
                        } else {
                            result.key = "DELETE";
                        }
                        break;
                    case GKey.Constant.F1:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF704);
                        } else {
                            result.key = "F1";
                        }
                        break;
                    case GKey.Constant.F2:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF705);
                        } else {
                            result.key = "F2";
                        }
                        break;
                    case GKey.Constant.F3:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF706);
                        } else {
                            result.key = "F3";
                        }
                        break;
                    case GKey.Constant.F4:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF707);
                        } else {
                            result.key = "F4";
                        }
                        break;
                    case GKey.Constant.F5:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF708);
                        } else {
                            result.key = "F5";
                        }
                        break;
                    case GKey.Constant.F6:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF709);
                        } else {
                            result.key = "F6";
                        }
                        break;
                    case GKey.Constant.F7:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70A);
                        } else {
                            result.key = "F7";
                        }
                        break;
                    case GKey.Constant.F8:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70B);
                        } else {
                            result.key = "F8";
                        }
                        break;
                    case GKey.Constant.F9:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70C);
                        } else {
                            result.key = "F9";
                        }
                        break;
                    case GKey.Constant.F10:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70D);
                        } else {
                            result.key = "F10";
                        }
                        break;
                    case GKey.Constant.F11:
                        if (process.platform === 'darwin') {
                            result.key = String.fromCharCode(0xF70E);
                        } else {
                            result.key = "F11";
                        }
                        break;
                    case GKey.Constant.F12:
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

    _.gShell = new GSystemHost;

    $(document).ready(function () {
        // Open dev console if desired
        var argv = gui.App.argv;
        if (_.gShell.isDevelopment() || argv.indexOf('-console') >= 0) {
            win.showDevTools();
        }

        gShellReady();
    });

    $(window).load(function () {
        gravit.storages.push(new GFileStorage());
        gShellFinished();
    });
})(this);
