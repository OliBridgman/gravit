(function (_) {
    /**
     * A menu representing a menu bar
     * @param {GMenu} [menu] optional menu to use as base
     * @class GMenuBar
     * @constructor
     * @version 1.0
     */
    function GMenuBar(menu) {
        this._menu = menu ? menu : new GMenu(this);
        this._menu._parent = this;
        this._menu._htmlElement.addClass('g-menu-root');
        this._htmlElement = $("<nav></nav>")
            .addClass("g-menu-bar")
            .append(this._menu._htmlElement);
    };

    /**
     * @type {GMenu}
     * @private
     */
    GMenuBar.prototype._menu = null;

    /**
     * Return the menu for the menu bar
     * @version 1.0
     */
    GMenuBar.prototype.getMenu = function () {
        return this._menu;
    };

    /**
     * This returns whether any menu on the menubar
     * is opened which means the bar is active
     * @return {Boolean}
     */
    GMenuBar.prototype.isActive = function () {
        var activeMenu = GMenu.getActiveMenu();
        if (activeMenu && activeMenu._parent && activeMenu._parent instanceof GMenuItem) {
            return activeMenu._parent.getMenuBar() === this;
        }
        return false;
    };

    /** @override */
    GMenuBar.prototype.toString = function () {
        return "[Object GMenuBar]";
    };

    _.GMenuBar = GMenuBar;
})(this);