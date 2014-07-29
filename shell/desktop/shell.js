(function (_) {
    var remote = require('remote');
    var Menu = remote.require('menu');
    var MenuItem = remote.require('menu-item');

    /**
     * The desktop shell
     * @class GDesktopShell
     * @extends GShell
     * @constructor
     */
    function GDesktopShell() {
        this._clipboardMimeTypes = {};

        window.onerror = function(message, url, line) {
            console('Sorry, an error ocurred, please report the error below and restart the application:', url + ':' + line + ':' + message);
        };

        var menu = new Menu();

        menu.append(new MenuItem({ label: 'MenuItem1', click: function () {
            console.log('item 1 clicked');
        } }));
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));


        this._menu = new Menu();
        this._menu.append(new MenuItem({label: 'TEST', submenu: menu}));


    };
    IFObject.inherit(GDesktopShell, GShell);

    /**
     * @type {Menu}
     * @private
     */
    GDesktopShell.prototype._menu = null;

    /**
     * @type {*}
     * @private
     */
    GDesktopShell.prototype._clipboardMimeTypes = null;

    /** @override */
    GDesktopShell.prototype.isDevelopment = function () {
        // TODO : Check console arguments
    };

    /** @override */
    GDesktopShell.prototype.prepareLoad = function () {
        // Init shell-specific stuff here
        // TODO: re-enable storage
        //gravit.storages.push(new GNativeStorage());
    };

    /** @override */
    GDesktopShell.prototype.finishLoad = function () {
        // TODO : Check for mac / window
        //Menu.setApplicationMenu(this._menu);

        // Open dev console if desired
        // TODO : re-enable dev console
        /*
         var argv = gui.App.argv;
         if (this.isDevelopment() || argv.indexOf('-console') >= 0) {
         win.showDevTools();
         }
         */

        // Callback
        gShellFinished();
    };

    /** @override */
    GDesktopShell.prototype.addMenu = function (parentMenu, title, callback) {
        parentMenu = parentMenu || this._menu;
        var menu = new Menu();

        parentMenu.append(new MenuItem({label: title, submenu: menu}));

        //if (callback) {
            var oldDelegate = menu.delegate.menuWillShow;
        //console.log(menu.delegate.menuWillShow);
            var newDelegate = function () {
                console.log('MENU WILL SHOW');
                oldDelegate();
          //      callback();
                console.log('MENU WILL SHOW DONE');
            }
        //}

        menu.delegate.menuWillShow = newDelegate;

        //newDelegate();
        menu.delegate.menuWillShow();

        menu.delegate.isCommandIdEnabled = function (id) {
            return false;
        }

        return menu;
    };

    /** @override */
    GDesktopShell.prototype.addMenuSeparator = function (parentMenu) {
        var item = new MenuItem({type: 'separator'});
        parentMenu.append(item);
        return item;
    };

    /** @override */
    GDesktopShell.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
        var item = new MenuItem({label: title, click: callback});

        /*

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
        */

        parentMenu.append(item);
        return item;
    };

    /** @override */
    GDesktopShell.prototype.updateMenuItem = function (item, title, enabled, checked) {
        item.label = title;
        item.enabled = enabled;
        //item.setCaption(title);
        //item.setEnabled(enabled);
        //item.setChecked(checked);
    };

    /** @override */
    GDesktopShell.prototype.removeMenuItem = function (parentMenu, child) {
        //parentMenu.removeItem(parentMenu.indexOf(child));
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

    _.gShell = new GDesktopShell;
})(this);
