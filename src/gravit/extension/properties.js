(function (_) {

    /**
     * Base class for properties
     * @class GProperties
     * @extends GEventTarget
     * @constructor
     */
    function GProperties() {
    };
    IFObject.inherit(GProperties, GEventTarget);

    /**
     * Called to return the category of the panel
     * @return {String|IFLocale.Key}
     */
    GProperties.prototype.getCategory = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to initialize the properties
     * @param {JQuery} panel the panel to init on
     * @param {JQuery} controls the controls panel to init on
     */
    GProperties.prototype.init = function (panel, controls) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update from an active node.
     * @param {GDocument} document the document to work on
     * @param {Array<IFElement>} elements array of elements, contains at least one
     * @param {IFNode} node the active node. May be null to indicate to work on elements
     */
    GProperties.prototype.updateFromNode = function (document, elements, node) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GProperties.prototype.toString = function () {
        return "[Object GProperties]";
    };

    _.GProperties = GProperties;
})(this);