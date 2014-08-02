(function (_) {
    /**
     * The browser shell
     * @class GBrowserShell
     * @extends GShell
     * @constructor
     */
    function GBrowserShell() {
        this._menuBar = new GUIMenuBar();
        this._clipboardMimeTypes = {};
    };
    IFObject.inherit(GBrowserShell, GShell);

    /**
     * @type {GUIMenuBar}
     * @private
     */
    GBrowserShell.prototype._menuBar = null;

    /**
     * @type {*}
     * @private
     */
    GBrowserShell.prototype._clipboardMimeTypes = null;

    /** @override */
    GBrowserShell.prototype.isDevelopment = function () {
        return document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1';
    };

    /** @override */
    GBrowserShell.prototype.prepareLoad = function () {
        // Add Gravit Loader
        $('<div></div>')
            .attr('id', 'gravit-loader')
            .css('position', 'absolute')
            .css('display', 'table')
            .css('width', '100%')
            .css('height', '100%')
            .append($('<div></div>')
                .css('display', 'table-cell')
                .css('vertical-align', 'middle')
                .css('text-align', 'center')
                .css('width', '100%')
                .css('height', '100%')
                .append($('<img>')
                    .attr('src', 'icon/icon_114x114.png'))
                .append($('<p></p>')
                    .css('line-height', '1.5em')
                    .css('color', 'gray')
                    .css('padding-top', '10px')
                    .html('I am preparing for your pleasure,<br/>please bear with me for a second or two.')))
            .appendTo($('body'));

    };

    /** @override */
    GBrowserShell.prototype.finishLoad = function () {
        // Append our menu bar element as first child of header
        var menuElement = this._menuBar._htmlElement;
        menuElement
            .css('height', '100%')
            .prependTo($('#header'));

        // Remove loader
        $("#gravit-loader").remove();

        // Callback
        gShellFinished();
    };

    /** @override */
    GBrowserShell.prototype.addMenu = function (parentMenu, title, callback) {
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
    GBrowserShell.prototype.addMenuSeparator = function (parentMenu) {
        var item = new GUIMenuItem(GUIMenuItem.Type.Divider);
        parentMenu.addItem(item);
        return item;
    };

    /** @override */
    GBrowserShell.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
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
    GBrowserShell.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.setCaption(title);
        item.setEnabled(enabled);
        item.setChecked(checked);
    };

    /** @override */
    GBrowserShell.prototype.removeMenuItem = function (parentMenu, child) {
        parentMenu.removeItem(parentMenu.indexOf(child));
    };

    /** @override */
    GBrowserShell.prototype.getClipboardMimeTypes = function () {
        return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GBrowserShell.prototype.getClipboardContent = function (mimeType) {
        if (this._clipboardMimeTypes && this._clipboardMimeTypes.hasOwnProperty(mimeType)) {
            return this._clipboardMimeTypes[mimeType];
        }
        return null;
    };

    /** @override */
    GBrowserShell.prototype.setClipboardContent = function (mimeType, content) {
        this._clipboardMimeTypes[mimeType] = content;
    };

    _.gShell = new GBrowserShell;
})(this);
