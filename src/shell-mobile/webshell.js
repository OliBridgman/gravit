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
    GObject.inherit(GWebShell, GShell);

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
                    .attr('src', 'assets/icon/icon_114x114.png'))
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
    };

    /** @override */
    GWebShell.prototype.registerShortcut = function (shortcut, action) {
        Mousetrap.bind(_shortcutToMouseTrapShortcut(shortcut), function () {
            action();
            return false;
        }.bind(this));
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
    GWebShell.prototype.addMenuItem = function (parentMenu, callback) {
        var item = new GUIMenuItem(GUIMenuItem.Type.Item);
        if (callback) {
            item.addEventListener(GUIMenuItem.ActivateEvent, callback);
        }
        parentMenu.addItem(item);
        return item;
    };

    /** @override */
    GWebShell.prototype.updateMenuItem = function (item, title, enabled, checked, shortcut) {
        item.setCaption(title);
        item.setEnabled(enabled);
        item.setChecked(checked);
        item.setShortcutHint(shortcut);

        if (shortcut) {
            Mousetrap.bind(_shortcutToMouseTrapShortcut(item.getShortcutHint()), function (e) {
                item.trigger(GUIMenuItem.ACTIVATE_EVENT);
                return false;
            }.bind(this));
        }
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
    GWebShell.prototype.getClipboarContent = function (mimeType) {
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

    /**
     * Convert internal key into a mousetrap-compatible key
     * @param {Array<*>} shortcut
     * @returns {String}
     */
    function _shortcutToMouseTrapShortcut(shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                result += "+";
            }

            var key = shortcut[i];
            if (typeof key == 'number') {
                switch (key) {
                    case GUIKey.Constant.META:
                        result += "meta";
                        break;
                    case GUIKey.Constant.OPTION:
                        result += "option";
                        break;
                    case GUIKey.Constant.REMOVE:
                        result += "del";
                        break;
                    case GUIKey.Constant.SPACE:
                        result += "space";
                        break;
                    case GUIKey.Constant.ENTER:
                        result += "enter";
                        break;
                    case GUIKey.Constant.TAB:
                        result += "tab";
                        break;
                    case GUIKey.Constant.BACKSPACE:
                        result += "backspace";
                        break;
                    case GUIKey.Constant.CONTROL:
                        result += "ctrl";
                        break;
                    case GUIKey.Constant.SHIFT:
                        result += "shift";
                        break;
                    case GUIKey.Constant.ALT:
                        result += "alt";
                        break;
                    case GUIKey.Constant.LEFT:
                        result += "left";
                        break;
                    case GUIKey.Constant.UP:
                        result += "up";
                        break;
                    case GUIKey.Constant.RIGHT:
                        result += "right";
                        break;
                    case GUIKey.Constant.DOWN:
                        result += "down";
                        break;
                    case GUIKey.Constant.PAGE_UP:
                        result += "pageup";
                        break;
                    case GUIKey.Constant.PAGE_DOWN:
                        result += "pagedown";
                        break;
                    case GUIKey.Constant.HOME:
                        result += "home";
                        break;
                    case GUIKey.Constant.END:
                        result += "end";
                        break;
                    case GUIKey.Constant.INSERT:
                        result += "ins";
                        break;
                    case GUIKey.Constant.DELETE:
                        result += "del";
                        break;
                    case GUIKey.Constant.ESCAPE:
                        result += "esc";
                        break;
                    case GUIKey.Constant.COMMAND:
                        result += "meta";
                        break;
                    case GUIKey.Constant.F1:
                        result += "f1";
                        break;
                    case GUIKey.Constant.F2:
                        result += "f2";
                        break;
                    case GUIKey.Constant.F3:
                        result += "f3";
                        break;
                    case GUIKey.Constant.F4:
                        result += "f4";
                        break;
                    case GUIKey.Constant.F5:
                        result += "f5";
                        break;
                    case GUIKey.Constant.F6:
                        result += "f6";
                        break;
                    case GUIKey.Constant.F7:
                        result += "f7";
                        break;
                    case GUIKey.Constant.F8:
                        result += "f8";
                        break;
                    case GUIKey.Constant.F9:
                        result += "f9";
                        break;
                    case GUIKey.Constant.F10:
                        result += "f10";
                        break;
                    case GUIKey.Constant.F11:
                        result += "f11";
                        break;
                    case GUIKey.Constant.F12:
                        result += "f12";
                        break;
                    default:
                        throw new Error("Unknown key code");
                }
            } else {
                result += key.toLowerCase();
            }
        }
        return result;
    };
})(this);
