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
    };

    /**
     * @type {GUIMenu}
     * @private
     */
    GUIMenuBar.prototype._menu = null;

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

    _.GUIMenuBar = GUIMenuBar;
})(this);