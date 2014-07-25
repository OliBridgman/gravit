(function (_) {

    /**
     * Base class for transform panels
     * @class GTransform
     * @extends GEventTarget
     * @constructor
     */
    function GTransform() {
    };

    /**
     * Called to return the category of the panel
     * @return {String|IFLocale.Key}
     */
    GTransform.prototype.getCategory = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to initialize the transform panel
     * @param {JQuery} panel the panel to init on
     */
    GTransform.prototype.init = function (panel) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update
     * @param {GDocument} document the document to work on
     * @param {Array<IFElement>} elements array of transformable elements, contains at least one
     * @return {Boolean} true if this transform panel is available, false if not
     */
    GTransform.prototype.update = function (document, elements) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GTransform.prototype.toString = function () {
        return "[Object GTransform]";
    };

    _.GTransform = GTransform;
})(this);