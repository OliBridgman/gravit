(function (_) {

    /**
     * Fill attribute
     * @class GFillAttribute
     * @extends GPatternAttribute
     * @constructor
     */
    function GFillAttribute() {
        GPatternAttribute.call(this);
    };
    GObject.inherit(GFillAttribute, GPatternAttribute);

    /** @override */
    GFillAttribute.prototype.getAttributeClass = function () {
        return IFFillAttribute;
    };

    /** @override */
    GFillAttribute.prototype.isCreateable = function () {
        return true;
    };

    /** @override */
    GFillAttribute.prototype.init = function (panel) {
        GPatternAttribute.prototype.init.call(this, panel);
    };

    /** @override */
    GFillAttribute.prototype.updateFromAttribute = function (document, attribute, assign) {
        GPatternAttribute.prototype.updateFromAttribute.call(this, document, attribute, assign);
    };

    /** @override */
    GFillAttribute.prototype.toString = function () {
        return "[Object GFillAttribute]";
    };

    _.GFillAttribute = GFillAttribute;
})(this);