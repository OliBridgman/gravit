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
            label: title,
            click: function () {
                alert('OPEN SUBMENU');
            }
        });

        var menu = new gui.Menu();
        item.submenu = menu;

        parentMenu.append(item);

        //if (callback) {
        //    item.getMenu().addEventListener(GUIMenu.OpenEvent, callback);
        //}

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
    GDesktopShell.prototype.addMenuItem = function (parentMenu, callback) {
        var item = new gui.MenuItem({
            type: 'normal',
            click: callback,
            label: "test"
        });
        parentMenu.append(item);
        return item;
    };

    /** @override */
    GDesktopShell.prototype.updateMenuItem = function (item, title, enabled, checked, shortcut) {
        item.label = title;
        console.log('SET LABEL ON ITEM: ' + title);
        //item.enabled = enabled;
        //item.checked = checked;
        /*
         item.setCaption(title);
         item.setEnabled(enabled);
         item.setChecked(checked);
         item.setShortcutHint(shortcut);
         */
    };

    /** @override */
    GDesktopShell.prototype.removeMenuItem = function (parentMenu, child) {
        //parentMenu.removeItem(parentMenu.indexOf(child));
    };

    /** @override */
    GDesktopShell.prototype.getClipboardMimeTypes = function () {
        //return this._clipboardMimeTypes ? Object.keys(this._clipboardMimeTypes) : null;
    };

    /** @override */
    GDesktopShell.prototype.getClipboarContent = function (mimeType) {
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

    _.gShell = new GDesktopShell;
})(this);
