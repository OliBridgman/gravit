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
     * @return {*} a directory reference
     */
    GHost.prototype.openDirectoryPrompt = function (done) {
        throw new Error('Not supported.');
    };

    /**
     * Open a file within a directory
     * @param {*} directory the directory reference to be used
     * @param {String} filename the filename relative to the directory
     * @param {Boolean} createIfNotExists create the file if it doesn't exist.
     * Has no effect when writeable is set to false.
     * @param {Boolean} writeable if true, open file to be writeable, otherwise
     * opens file as read-only
     * @param {Function} done called with the file reference used for reading/writing
     */
    GHost.prototype.openDirectoryFile = function (directory, filename, createIfNotExists, writeable, done) {
        throw new Error('Not supported.');
    };

    /**
     * Get the contents of a file
     * @param {*} file the file reference to gets contents for
     * @param {Boolean} binary if true, the data is read as binary,
     * otherwise it is read as String
     * @param {Function} callback called with the data contents which
     * is either an ArrayBuffer for binary or a String
     * @return {String}
     */
    GHost.prototype.getFileContents = function (file, binary, done) {
        throw new Error('Not Supported.');
    };

    /**
     * Put contents into a file
     * @param {*} file the file reference to put contents into
     * @param {ArrayBuffer|String} data the data to put. If
     * binary is set to true, an ArrayBuffer is expected, otherwise a string
     * @param {Boolean} binary whether the data is binary or not
     * @param {Function} callback called when data was stored
     */
    GHost.prototype.putFileContents = function (file, data, binary, done) {
        throw new Error('Not Supported.');
    };

    _.GHost = GHost;
})(this);
