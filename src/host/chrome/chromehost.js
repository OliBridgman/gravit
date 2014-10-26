(function (_) {
    /**
     * The chrome host
     * @class GChromeHost
     * @extends GHost
     * @constructor
     */
    function GChromeHost() {
        this._menuBar = new GMenuBar();
        this._clipboardMimeTypes = {};
    };
    GObject.inherit(GChromeHost, GHost);

    /**
     * @type {GMenuBar}
     * @private
     */
    GChromeHost.prototype._menuBar = null;

    /**
     * @type {*}
     * @private
     */
    GChromeHost.prototype._clipboardMimeTypes = null;

    /** @override */
    GChromeHost.prototype.isDevelopment = function () {
        return document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1';
    };

    /** @override */
    GChromeHost.prototype.prepare = function () {
        // Append our menu bar element as first child of header
        var menuElement = this._menuBar._htmlElement;
        menuElement
            .css('height', '100%')
            .prependTo($('#header'));
    };

    /** @override */
    GChromeHost.prototype.addMenu = function (parentMenu, title, callback) {
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
    GChromeHost.prototype.addMenuSeparator = function (parentMenu) {
        var item = new GMenuItem(GMenuItem.Type.Divider);
        parentMenu.addItem(item);
        return item;
    };

    /** @override */
    GChromeHost.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
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
    GChromeHost.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.setCaption(title);
        item.setEnabled(enabled);
        item.setChecked(checked);
    };

    /** @override */
    GChromeHost.prototype.removeMenuItem = function (parentMenu, child) {
        parentMenu.removeItem(parentMenu.indexOf(child));
    };

    /** @override */
    GChromeHost.prototype.getClipboardMimeTypes = function () {
        return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GChromeHost.prototype.getClipboardContent = function (mimeType) {
        if (this._clipboardMimeTypes && this._clipboardMimeTypes.hasOwnProperty(mimeType)) {
            return this._clipboardMimeTypes[mimeType];
        }
        return null;
    };

    /** @override */
    GChromeHost.prototype.setClipboardContent = function (mimeType, content) {
        this._clipboardMimeTypes[mimeType] = content;
    };

    _.gShell = new GChromeHost;

    $(document).ready(function () {
        gShellReady();
    });

    $(window).load(function () {
        gravit.storages.push(new GFileStorage());
        gShellFinished();
    });
})(this);
