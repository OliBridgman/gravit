(function (_) {

    /**
     * A base paint style
     * @class GXPaintStyle
     * @extends GXStyleSet
     * @constructor
     */
    function GXPaintStyle() {
    }

    GObject.inherit(GXPaintStyle, GXStyleSet);

    /** @override */
    GXPaintStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXStyleSet || parent instanceof GXVectorStyle;
    };

    /** @override */
    GXPaintStyle.prototype.toString = function () {
        return "[GXPaintStyle]";
    };

    _.GXPaintStyle = GXPaintStyle;
})(this);