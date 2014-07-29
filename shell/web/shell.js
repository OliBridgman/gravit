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

        window.onerror = function(message, url, line) {
            prompt('Sorry, an error ocurred, please report the error below and restart the application:', url + ':' + line + ':' + message);
        };
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
        return document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1';
    };

    /** @override */
    GWebShell.prototype.prepareLoad = function () {
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
    GWebShell.prototype.finishLoad = function () {
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
