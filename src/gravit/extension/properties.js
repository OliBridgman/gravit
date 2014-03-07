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
     */
    EXProperties.prototype.init = function (panel, controls) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update from a given set of nodes. Note that
     * this will only called if there is at least one node
     * available in the given nodes array.
     * @param {EXDocument} document the document to work on
     * @param {Array<GXNode>} nodes the nodes to update from
     * @return {Boolean} true if the panel is available for
     * the given set of nodes, false if not
     */
    EXProperties.prototype.updateFromNodes = function (document, nodes) {
        // NO-OP
    };

    /** @override */
    EXProperties.prototype.toString = function () {
        return "[Object EXProperties]";
    };

    _.EXProperties = EXProperties;
})(this);