(function (_) {

    /**
     * Base class for properties
     * @class EXProperties
     * @extends GEventTarget
     * @constructor
     */
    function EXProperties() {
    };
    GObject.inherit(EXProperties, GEventTarget);

    /**
     * Called to return the category of the panel
     * @return {String|GLocale.Key}
     */
    EXProperties.prototype.getCategory = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to initialize the properties
     * @param {JQuery} panel the panel to init on
     * @param {JQuery} controls the controls panel to init on
     * @param {GUIMenu} menu the properties menu to init on
     */
    EXProperties.prototype.init = function (panel, controls, menu) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update from an active node.
     * @param {EXDocument} document the document to work on
     * @param {Array<GXElement>} elements array of elements, contains at least one
     * @param {GXNode} node the active node. May be null to indicate to work on elements
     */
    EXProperties.prototype.updateFromNode = function (document, elements, node) {
        throw new Error("Not Supported.");
    };

    /** @override */
    EXProperties.prototype.toString = function () {
        return "[Object EXProperties]";
    };

    _.EXProperties = EXProperties;
})(this);