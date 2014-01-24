(function (_) {
    /**
     * A menu representing a menu bar
     * @param {GUIMenu} [menu] optional menu to use as base
     * @class GUIMenuBar
     * @constructor
     * @version 1.0
     */
    function GUIMenuBar(menu) {
        this._menu = menu ? menu : new GUIMenu(this);
        this._menu._parent = this;
        this._menu._htmlElement.addClass('g-menu-root');
        this._htmlElement = $("<nav></nav>")
            .addClass("g-menu-bar")
            .append(this._menu._htmlElement);

        this._htmlElement.on("mouseover", this._mouseOver.bind(this));
    };

    /**
     * @type {GUIMenu}
     * @private
     */
    GUIMenuBar.prototype._menu = null;

    /**
     * This returns whether any menu on the menubar
     * is opened which means the bar is active
     * @return {Boolean}
     */
    GUIMenuBar.prototype.isActive = function () {
        var activeMenu = GUIMenu.getActiveMenu();
        if (activeMenu && activeMenu._parent && activeMenu._parent instanceof GUIMenuItem) {
            return activeMenu._parent.getMenuBar() === this;
        }
        return false;
    };

    /**
     * Return the menu for the menu bar
     * @version 1.0
     */
    GUIMenuBar.prototype.getMenu = function () {
        return this._menu;
    };

    /** @override */
    GUIMenuBar.prototype.toString = function () {
        return "[Object GUIMenuBar]";
    };

    GUIMenuBar.prototype._mouseOver = function (evt) {
        /*
         if (evt.target === this._htmlElement[0] && this.isActive()) {
         GUIMenu.setActiveMenu(null);
         }
         */
    };

    _.GUIMenuBar = GUIMenuBar;
})(this);