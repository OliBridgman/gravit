(function (_) {
    /**
     * The global host class
     * @class GHost
     * @extends GEventTarget
     * @constructor
     */
    function GHost() {
    };
    GObject.inherit(GHost, GEventTarget);

    /**
     * Called to check whether host is in development mode or not
     * @return {Boolean}
     */
    GHost.prototype.isDevelopment = function () {
        return false;
    };

    /**
     * Called to let the host prepare init. This is called
     * *before* the app gets initialized.
     */
    GHost.prototype.init = function () {
        // NO-OP
    };

    /**
     * Called to let the host start. This will be called
     * after the app is initialized but not yet started.
     */
    GHost.prototype.start = function () {
        // NO-OP
    };

    /**
     * Called whenever a menu shall be added
     * @param {*} parentMenu parent menu, may be null to add to the root
     * @param {String} title the title of the menu item
     * @param {Function} [callback] called whenever the menu opens to
     * prepare for any item updates before showing it
     * @return {*} a host-specific menu instance
     */
    GHost.prototype.addMenu = function (parentMenu, title, callback) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu separator shall be added
     * @param {*} parentMenu parent menu to add the separator, may not be null
     * @return {*} a host-specific menu separator instance
     */
    GHost.prototype.addMenuSeparator = function (parentMenu) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu item shall be added
     * @param {*} parentMenu parent menu to add the item, may not be null
     * @param {String} title the title of the item
     * @param {Boolean} checkable whether the item is a checkable one or not
     * @param {Array<*>} shortcut the shortcut for the item
     * @param {Function} [callback] called whenever the item is activated
     * @return {*} a host-specific menu item instance
     */
    GHost.prototype.addMenuItem = function (parentMenu, title, checkable, shortcut, callback) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu item shall be updated
     * @param {*} item the host-specific menu item instance to update
     * @param {String} title the title of the item
     * @param {Boolean} enabled whether the item is enabled or not
     * @param {Boolean} checked whether the item is checked or not
     */
    GHost.prototype.updateMenuItem = function (item, title, enabled, checked) {
        throw new Error("Not Supported.");
    };

    /**
     * Called whenever a menu item shall be removed
     * @param {*} parentMenu the parent menu to remove a child from
     * @param {*} child the child to be removed
     */
    GHost.prototype.removeMenuItem = function (parentMenu, child) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to return all available mime-types from the clipboard
     * @return {Array<String>} a list of mime-types available on clipboard
     * or null if there's nothing
     */
    GHost.prototype.getClipboardMimeTypes = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to return clipboard contents of a given mime-type
     * @return {*} the clipboard contents of the given mime-type
     * or null if there's none
     */
    GHost.prototype.getClipboardContent = function (mimeType) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to push something into the clipboard
     * @param {String} mimeType the mime-type of the contents
     * @param {*} content the contents to push into clipboard
     */
    GHost.prototype.setClipboardContent = function (mimeType, content) {
        throw new Error("Not Supported.");
    };

    /**
     * Prompt for opening a directory
     * @param {Function} done called with the directory and the directory name as arguments
     */
    GHost.prototype.openDirectoryPrompt = function (done) {
        throw new Error('Not supported.');
    };

    _.GHost = GHost;
})(this);
