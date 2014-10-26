(function (_) {
    /**
     * The browser host
     * @class GBrowserHost
     * @extends GHost
     * @constructor
     */
    function GBrowserHost() {
        this._menuBar = new GMenuBar();
        this._clipboardMimeTypes = {};
    };
    GObject.inherit(GBrowserHost, GHost);

    /**
     * @type {GMenuBar}
     * @private
     */
    GBrowserHost.prototype._menuBar = null;

    /**
     * @type {*}
     * @private
     */
    GBrowserHost.prototype._clipboardMimeTypes = null;

    /** @override */
    GBrowserHost.prototype.isDevelopment = function () {
        return document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1';
    };

    /** @override */
    GBrowserHost.prototype.prepare = function () {
        // Append our menu bar element as first child of header
        var menuElement = this._menuBar._htmlElement;
        menuElement
            .css('height', '100%')
            .prependTo($('#header'));
    };

    /** @override */
    GBrowserHost.prototype.addMenu = function (parentMenu, title, callback) {
        parentMenu = parentMenu || this._menuBar.getMenu();
        var item = new GMenuItem(GMenuItem.Type.Menu);
        item.setCaption(title);
        parentMenu.addItem(item);

        if (callback) {
            item.getMenu().addEventListener(GMenu.OpenEvent, callback);
        }

        return item.getMenu();
    };

    /** @override */
    GBrowserHost.prototype.addMenuSeparator = function (parentMenu) {
        var item = new GMenuItem(GMenuItem.Type.Divider);
        parentMenu.addItem(item);
        return item;
    };

    /** @override */
    GBrowserHost.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
        var item = new GMenuItem(GMenuItem.Type.Item);
        if (callback) {
            item.addEventListener(GMenuItem.ActivateEvent, callback);
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
    GBrowserHost.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.setCaption(title);
        item.setEnabled(enabled);
        item.setChecked(checked);
    };

    /** @override */
    GBrowserHost.prototype.removeMenuItem = function (parentMenu, child) {
        parentMenu.removeItem(parentMenu.indexOf(child));
    };

    /** @override */
    GBrowserHost.prototype.getClipboardMimeTypes = function () {
        return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GBrowserHost.prototype.getClipboardContent = function (mimeType) {
        if (this._clipboardMimeTypes && this._clipboardMimeTypes.hasOwnProperty(mimeType)) {
            return this._clipboardMimeTypes[mimeType];
        }
        return null;
    };

    /** @override */
    GBrowserHost.prototype.setClipboardContent = function (mimeType, content) {
        this._clipboardMimeTypes[mimeType] = content;
    };

    _.gShell = new GBrowserHost;

    $(document).ready(function () {
        gShellReady();
    });

    $(window).load(function () {
        gShellFinished();
    });
})(this);
