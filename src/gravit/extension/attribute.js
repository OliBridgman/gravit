(function (_) {

    /**
     * Base class for attribute properties
     * @class GAttribute
     * @extends GEventTarget
     * @constructor
     */
    function GAttribute() {
    };
    GObject.inherit(GAttribute, GEventTarget);

    /**
     * Called to return the attribute class of this
     * @return {Function}
     */
    GAttribute.prototype.getAttributeClass = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to check whether a type of this attribute can be created or not
     * @return {Boolean}
     */
    GAttribute.prototype.isCreateable = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to initialize the properties
     * @param {JQuery} panel the panel to init on
     */
    GAttribute.prototype.init = function (panel) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update from a given attribute of this type.
     * @param {EXDocument} document the document to work on
     * @param {IFAttribute} attribute the attribute to work on
     * @param {Function(properties: Array<String>, values: Array<*>)} assign the
     * assignment function to be called to assign one or more properties to the attribute
     * @return {Boolean} true if the panel is available for
     * the given attribute, false if not
     */
    GAttribute.prototype.updateFromAttribute = function (document, attribute, assign) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GAttribute.prototype.toString = function () {
        return "[Object GAttribute]";
    };

    _.GAttribute = GAttribute;
})(this);