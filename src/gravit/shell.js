(function (_) {
    /**
     * The global shell class
     * @class GShell
     * @extends GEventTarget
     * @constructor
     */
    function GShell() {
    };
    GObject.inherit(GShell, GEventTarget);

    /**
     * Called to prepare loading of the shell
     */
    GShell.prototype.prepareLoad = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to finish loading of the shell
     */
    GShell.prototype.finishLoad = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu shall be added
     * @param {*} parentMenu parent menu, may be null to add to the root
     * @param {String} title the title of the menu item
     * @param {Function} [callback] called whenever the menu opens to
     * prepare for any item updates before showing it
     * @return {*} a shell-specific menu instance
     */
    GShell.prototype.addMenu = function (parentMenu, title, callback) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu separator shall be added
     * @param {*} parentMenu parent menu to add the separator, may not be null
     * @return {*} a shell-specific menu separator instance
     */
    GShell.prototype.addMenuSeparator = function (parentMenu) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu item shall be added
     * @param {*} parentMenu parent menu to add the item, may not be null
     * @param {Function} [callback] called whenever the item is activated
     * @return {*} a shell-specific menu item instance
     */
    GShell.prototype.addMenuItem = function (parentMenu, callback) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu item shall be updated
     * @param {*} item the shell-specific menu item instance to update
     * @param {String} title the title of the item
     * @param {Boolean} enabled whether the item is enabled or not
     * @param {Boolean} checked whether the item is checked or not
     * @param {Array<*>} shortcut the shortcut for the item
     */
    GShell.prototype.updateMenuItem = function (item, title, enabled, checked, shortcut) {
        throw new Error("Not Supported.");
    };


    /**
     * Called whenever a menu item shall be removed
     * @param {*} parentMenu the parent menu to remove a child from
     * @param {*} child the child to be removed
     */
    GShell.prototype.removeMenuItem = function (parentMenu, child) {
        throw new Error("Not Supported.");
    };

    _.GShell = GShell;
    _.gShell = null; // initialized by client
})(this);
