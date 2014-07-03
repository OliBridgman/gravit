(function (_) {
    /**
     * The web shell
     * @class GWebShell
     * @extends GShell
     * @constructor
     */
    function GWebShell() {
        this._menuBar = new GUIMenuBar();
        this._clipboardMimeTypes = {};
    };
    IFObject.inherit(GWebShell, GShell);

    /**
     * @type {GUIMenuBar}
     * @private
     */
    GWebShell.prototype._menuBar = null;

    /**
     * @type {*}
     * @private
     */
    GWebShell.prototype._clipboardMimeTypes = null;

    /** @override */
    GWebShell.prototype.isDevelopment = function () {
        var argv = gui.App.argv;
        return argv.indexOf('-dev') >= 0;
    };

    /** @override */
    GWebShell.prototype.prepareLoad = function () {
        // Init shell-specific stuff here
        gravit.storages.push(new GNativeStorage());

    };

    /** @override */
    GWebShell.prototype.finishLoad = function () {
        initWindowState();
        var win = gui.Window.get();

        // Append our menu bar element as first child of header
        var menuElement = this._menuBar._htmlElement;
        menuElement
            .css('height', '100%')
            .prependTo($('#header'));

        // Remove loader
        $("#gravit-loader").remove();

        // Open dev console if desired
        var argv = gui.App.argv;
        if (this.isDevelopment() || argv.indexOf('-console') >= 0) {
            win.showDevTools();
        }
    };

    /** @override */
    GWebShell.prototype.addMenu = function (parentMenu, title, callback) {
        parentMenu = parentMenu || this._menuBar.getMenu();
        var item = new GUIMenuItem(GUIMenuItem.Type.Menu);
        item.setCaption(title);
        parentMenu.addItem(item);

        if (callback) {
            item.getMenu().addEventListener(GUIMenu.OpenEvent, callback);
        }

        return item.getMenu();
    };

    /** @override */
    GWebShell.prototype.addMenuSeparator = function (parentMenu) {
        var item = new GUIMenuItem(GUIMenuItem.Type.Divider);
        parentMenu.addItem(item);
        return item;
    };

    /** @override */
    GWebShell.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
        var item = new GUIMenuItem(GUIMenuItem.Type.Item);
        if (callback) {
            item.addEventListener(GUIMenuItem.ActivateEvent, callback);
        }

        if (shortcut) {
            gApp.registerShortcut(shortcut, function () {
                callback();
            }.bind(this));

            item.setShortcutHint(shortcut);
        }

        this.updateMenuItem(item, title, true, false);
        parentMenu.addItem(item);
        return item;
    };

    /** @override */
    GWebShell.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.setCaption(title);
        item.setEnabled(enabled);
        item.setChecked(checked);
    };

    /** @override */
    GWebShell.prototype.removeMenuItem = function (parentMenu, child) {
        parentMenu.removeItem(parentMenu.indexOf(child));
    };

    /** @override */
    GWebShell.prototype.getClipboardMimeTypes = function () {
        return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GWebShell.prototype.getClipboardContent = function (mimeType) {
        if (this._clipboardMimeTypes && this._clipboardMimeTypes.hasOwnProperty(mimeType)) {
            return this._clipboardMimeTypes[mimeType];
        }
        return null;
    };

    /** @override */
    GWebShell.prototype.setClipboardContent = function (mimeType, content) {
        this._clipboardMimeTypes[mimeType] = content;
    };

    _.gShell = new GWebShell;
})(this);
