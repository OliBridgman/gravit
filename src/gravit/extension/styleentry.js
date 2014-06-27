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
     * Called to create the contents for a given entry
     * @param {IFStyleEntry} entry
     * @return {JQuery} the contents
     */
    GStyleEntry.prototype.createContent = function (entry) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update the created content with the values of a given entry
     * @param {JQuery} content
     * @param {IFStyleEntry} entry
     */
    GStyleEntry.prototype.updateContent = function (content, entry) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GStyleEntry.prototype.toString = function () {
        return "[Object GStyleEntry]";
    };

    _.GStyleEntry = GStyleEntry;
})(this);