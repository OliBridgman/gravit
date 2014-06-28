(function (_) {

    /**
     * Base class for style entry handlers
     * @class GStyleEntry
     * @constructor
     */
    function GStyleEntry() {
    };

    /**
     * Should return the entry class this one handles
     * @return {IFStyleEntry}
     */
    GStyleEntry.prototype.getEntryClass = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Should return the name of the entry class
     * @return {String|IFLocale.Key}
     */
    GStyleEntry.prototype.getEntryName = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to create the contents
     * @param {IFScene} scene the active scene
     * @param {Function} assign callback to assign properties
     * @param {Function} revert callback to revert properties
     * @return {JQuery} the contents
     */
    GStyleEntry.prototype.createContent = function (scene, assign, revert) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update the created content with the values of a given entry
     * @param {JQuery} content
     * @param {IFStyleEntry} entry
     */
    GStyleEntry.prototype.updateProperties = function (content, entry) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to assign the values of the content to the given entry
     * @param {JQuery} content
     * @param {IFStyleEntry} entry
     */
    GStyleEntry.prototype.assignProperties = function (content, entry) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GStyleEntry.prototype.toString = function () {
        return "[Object GStyleEntry]";
    };

    _.GStyleEntry = GStyleEntry;
})(this);