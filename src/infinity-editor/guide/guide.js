(function (_) {
    /**
     * Base for a guide
     * @param {IFGuides} guides the owner guides
     * @class IFGuide
     * @constructor
     */
    function IFGuide(guides) {
        this._guides = guides;
        this._scene = guides._scene;
    }

    IFObject.inherit(IFGuide, IFObject);

    /**
     * @type {IFGuides}
     * @private
     */
    IFGuide.prototype._guides = null;

    /**
     * @type {IFScene}
     * @private
     */
    IFGuide.prototype._scene = null;

    // -----------------------------------------------------------------------------------------------------------------
    // IFGuide.Visual Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin marking a guide to be paintable
     * @class IFGuide.Visual
     * @constructor
     * @mixin
     */
    IFGuide.Visual = function () {
        
    };
    
    /**
     * Called whenever the guides should paint itself
     * @param {IFTransform} transform the transformation of the scene
     * @param {IFPaintContext} context
     */
    IFGuide.Visual.prototype.paint = function (transform, context) {
        // NO-OP
    };

    /** @override */
    IFGuide.Visual.prototype.toString = function () {
        return "[Mixin IFGuide.Visual]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFGuide.Map Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin marking a guide to be mappable
     * @class IFGuide.Map
     * @constructor
     * @mixin
     */
    IFGuide.Map = function () {

    };

    /**
     * Called to let this guide map horizontal and vertical coordinates
     * @param {Number} x
     * @param {Number} y
     * @return {{x: {value: Number, visual: Boolean}, y: {value: Number, visual: Boolean}}}
     */
    IFGuide.Map.prototype.map = function (x, y) {
        // NO-OP
    };

    /** @override */
    IFGuide.Map.prototype.toString = function () {
        return "[Mixin IFGuide.Map]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFGuide
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    IFGuide.prototype.toString = function () {
        return "[Object IFGuide]";
    };

    _.IFGuide = IFGuide;
})(this);