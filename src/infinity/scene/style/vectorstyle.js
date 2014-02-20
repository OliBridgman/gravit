(function (_) {

    /**
     * A base vector effect style
     * @class GXVectorStyle
     * @extends GXStyleSet
     * @constructor
     */
    function GXVectorStyle() {
    }

    GObject.inherit(GXVectorStyle, GXStyleSet);

    /** @override */
    GXVectorStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXStyleSet || parent instanceof GXVectorStyle;
    };

    /** @override */
    GXVectorStyle.prototype.toString = function () {
        return "[GXVectorStyle]";
    };

    _.GXVectorStyle = GXVectorStyle;
})(this);