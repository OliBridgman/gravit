(function (_) {

    /**
     * Base class for property panels
     * @class GProperties
     * @extends GEventTarget
     * @constructor
     */
    function GProperties() {
    };

    /**
     * Called to return the category of the panel
     * @return {String|IFLocale.Key}
     */
    GProperties.prototype.getCategory = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to initialize the properties panel
     * @param {JQuery} panel the panel to init on
     * @param {JQuery} controls the controls panel to init on
     */
    GProperties.prototype.init = function (panel, controls) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update
     * @param {GDocument} document the document to work on
     * @param {Array<IFElement>} elements array of elements, contains at least one
     * @return {Boolean} true if this properties panel is available, false if not
     */
    GProperties.prototype.update = function (document, elements) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GProperties.prototype.toString = function () {
        return "[Object GProperties]";
    };

    _.GProperties = GProperties;
})(this);