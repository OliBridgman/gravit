(function (_) {

    /**
     * Base class for transformer panels
     * @class GTransformer
     * @extends GEventTarget
     * @constructor
     */
    function GTransformer() {
    };

    /**
     * Called to return the category of the panel
     * @return {String|IFLocale.Key}
     */
    GTransformer.prototype.getCategory = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to initialize the transform panel
     * @param {JQuery} panel the panel to init on
     * @param {JQuery} controls the controls panel to init on
     */
    GTransformer.prototype.init = function (panel, controls) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update
     * @param {GDocument} document the document to work on
     * @param {Array<IFElement>} elements array of transformable elements, contains at least one
     * @return {Boolean} true if this transform panel is available, false if not
     */
    GTransformer.prototype.update = function (document, elements) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GTransformer.prototype.toString = function () {
        return "[Object GTransformer]";
    };

    _.GTransformer = GTransformer;
})(this);