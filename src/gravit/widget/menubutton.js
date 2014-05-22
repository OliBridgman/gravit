(function (_) {
    /**
     * A menu represented as a button
     * @class GUIMenuButton
     * @constructor
     * @version 1.0
     */
    function GUIMenuButton() {
        // Create a root menu reflecting our button
        var menu = new GUIMenu(this);
        this._htmlElement = menu._htmlElement
            .addClass('g-menu-root g-menu-button');

        // Create our root item
        this._item = new GUIMenuItem(GUIMenuItem.Type.Menu);
        menu.addItem(this._item);
        this._item._htmlElement.addClass('g-button');
    };

    /**
     * @type {GUIMenuItem}
     * @private
     */
    GUIMenuButton.prototype._item = null;

    /**
     * @returns {Stringg|JQuery} the menu-button's icon
     */
    GUIMenuButton.prototype.getIcon = function () {
        return this._item.getIcon();
    };

    /**
     * Assign the menu-button's icon which may be an icon class
     * or a JQuery Html-Element
     * @param {Stringg|JQuery} icon the icon or null for none
     */
    GUIMenuButton.prototype.setIcon = function (icon) {
        this._item.setIcon(icon);
    };

    /**
     * @returns {IFLocale.Key|String} the menu-button's caption
     * @version 1.0
     */
    GUIMenuButton.prototype.getCaption = function () {
        return this._item.getCaption();
    };

    /**
     * Assigns the menu-button's the caption
     * @param {IFLocale.Key|String} caption
     * @version 1.0
     */
    GUIMenuButton.prototype.setCaption = function (caption) {
        this._item.setCaption(caption);
    };

    /**
     * @returns {Boolean} whether the menu-button is enabled or not
     * @version 1.0
     */
    GUIMenuButton.prototype.isEnabled = function () {
        return this._item.isEnabled();
    };

    /**
     * Assign whether the menu-button is enabled or not
     * @param {Boolean} checked
     * @version 1.0
     */
    GUIMenuButton.prototype.setEnabled = function (enabled) {
        this._item.setEnabled(enabled);
    };

    /**
     * Return the menu for the menu button
     * @version 1.0
     */
    GUIMenuButton.prototype.getMenu = function () {
        return this._item.getMenu();
    };

    /**
     * Assigns the menu for the menu button
     * @param {GUIMenu} menu
     */
    GUIMenuButton.prototype.setMenu = function (menu) {
        this._item.setMenu(menu);
    };

    /** @override */
    GUIMenuButton.prototype.toString = function () {
        return "[Object GUIMenuButton]";
    };

    _.GUIMenuButton = GUIMenuButton;
})(this);