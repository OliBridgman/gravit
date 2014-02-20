(function (_) {

    /**
     * A base raster effect style
     * @class GXRasterStyle
     * @extends GXStyleSet
     * @constructor
     */
    function GXRasterStyle() {
    }

    GObject.inherit(GXRasterStyle, GXStyleSet);

    /** @override */
    GXRasterStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXPaintStyle;
    };

    /** @override */
    GXRasterStyle.prototype.toString = function () {
        return "[GXRasterStyle]";
    };

    _.GXRasterStyle = GXRasterStyle;
})(this);