(function (_) {
    /**
     * The global shell class
     * @class GShell
     * @extends IFEventTarget
     * @constructor
     */
    function GShell() {
    };
    IFObject.inherit(GShell, IFEventTarget);

    /**
     * Called to check whether shell is in development mode or not
     * @return {Boolean}
     */
    GShell.prototype.isDevelopment = function () {
        return false;
    };

    /**
     * Called to let the shell prepare itself. This is called
     * *after* the app has been initialized.
     */
    GShell.prototype.prepare = function () {
        // NO-OP
    };

    /**
     * Called to let the shell start. This is the last
     * point in the startup sequence and by default
     * this will simply create a new document
     */
    GShell.prototype.start = function () {
        gApp.createNewDocument();
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
     * @param {String} title the title of the item
     * @param {Boolean} checkable whether the item is a checkable one or not
     * @param {Array<*>} shortcut the shortcut for the item
     * @param {Function} [callback] called whenever the item is activated
     * @return {*} a shell-specific menu item instance
     */
    GShell.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu item shall be updated
     * @param {*} item the shell-specific menu item instance to update
     * @param {String} title the title of the item
     * @param {Boolean} enabled whether the item is enabled or not
     * @param {Boolean} checked whether the item is checked or not
     */
    GShell.prototype.updateMenuItem = function (item, title, enabled, checked) {
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

    /**
     * Called to return all available mime-types from the clipboard
     * @return {Array<String>} a list of mime-types available on clipboard
     * or null if there's nothing
     */
    GShell.prototype.getClipboardMimeTypes = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to return clipboard contents of a given mime-type
     * @return {*} the clipboard contents of the given mime-type
     * or null if there's none
     */
    GShell.prototype.getClipboardContent = function (mimeType) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to push something into the clipboard
     * @param {String} mimeType the mime-type of the contents
     * @param {*} content the contents to push into clipboard
     */
    GShell.prototype.setClipboardContent = function (mimeType, content) {
        throw new Error("Not Supported.");
    };

    _.GShell = GShell;
    _.gShell = null; // initialized by client
})(this);
