(function (_) {
    /**
     * Base for a guide
     * @param {GGuides} guides the owner guides
     * @class GGuide
     * @constructor
     */
    function GGuide(guides) {
        this._guides = guides;
        this._scene = guides._scene;
    }

    GObject.inherit(GGuide, GObject);

    /**
     * @type {GGuides}
     * @private
     */
    GGuide.prototype._guides = null;

    /**
     * @type {GScene}
     * @private
     */
    GGuide.prototype._scene = null;

    // -----------------------------------------------------------------------------------------------------------------
    // GGuide.Visual Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin marking a guide to be paintable
     * @class GGuide.Visual
     * @constructor
     * @mixin
     */
    GGuide.Visual = function () {
        
    };
    
    /**
     * Called whenever the guides should paint itself
     * @param {GTransform} transform the transformation of the scene
     * @param {GPaintContext} context
     */
    GGuide.Visual.prototype.paint = function (transform, context) {
        // NO-OP
    };

    /** @override */
    GGuide.Visual.prototype.toString = function () {
        return "[Mixin GGuide.Visual]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GGuide.Map Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin marking a guide to be mappable
     * @class GGuide.Map
     * @constructor
     * @mixin
     */
    GGuide.Map = function () {

    };

    /**
     * Called to let this guide map horizontal and vertical coordinates
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} useMargin
     * @return {{x: {value: Number, guide: GPoint|Array<GPoint>}, y: {value: Number, guide: GPoint|Array<GPoint>}}}
     */
    GGuide.Map.prototype.map = function (x, y, useMargin) {
        // NO-OP
    };

    /**
     * Called to check for each guide if mapping is allowed at the current moment. It may be blocked due to
     * key modifiers like CTRL, and so on.
     * @returns {Boolean}
     */
    GGuide.Map.prototype.isMappingAllowed = function () {
        return true;
    };

    /** @override */
    GGuide.Map.prototype.toString = function () {
        return "[Mixin GGuide.Map]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GGuide
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    GGuide.prototype.toString = function () {
        return "[Object GGuide]";
    };

    _.GGuide = GGuide;
})(this);