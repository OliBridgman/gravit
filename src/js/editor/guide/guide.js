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

    /**
     * Array of elements, which should be excluded from snapping to them
     * @type {Array}
     * @private
     */
    GGuide.prototype._exclusions = null;

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
    // GGuide.DetailMap Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin marking a guide should work in Detail Mode
     * @class GGuide.DetailMap
     * @constructor
     * @mixin
     */
    GGuide.DetailMap = function () {
    };

    /**
     * @enum
     */
    GGuide.DetailMap.Mode = {
        /** Use detail mode filter, detail mode is on */
        DetailOnFilterOn: 1,
        /** Use detail mode filter, detail mode is off */
        DetailOffFilterOn: 2,
        /** Don't use detail mode filter */
        FilterOff: 3
    };

    /** @override */
    GGuide.DetailMap.prototype.toString = function () {
        return "[Mixin GGuide.DetailMap]";
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
     * @param {GGuide.DetailMap.Mode} detail - allow depending on detail mode settings and DetailMap mixin;
     * if detail is not specified, considered the default value GGuide.DetailMap.Mode.FilterOff
     * @returns {Boolean}
     */
    GGuide.Map.prototype.isMappingAllowed = function (detail) {
        var res = true;
        if (detail === GGuide.DetailMap.Mode.DetailOnFilterOn) {
            res = this.hasMixin(GGuide.DetailMap);
        } else if (detail === GGuide.DetailMap.Mode.DetailOffFilterOn) {
            res = false;
        }
        return res;
    };

    /** @override */
    GGuide.Map.prototype.toString = function () {
        return "[Mixin GGuide.Map]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GGuide
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Use the passed list of elements as exclusions from snapping to them
     * @param {Array} exclusions
     */
    GGuide.prototype.useExclusions = function (exclusions) {
        this._exclusions = exclusions;
    };

    /**
     * Clean exclusions list
     */
    GGuide.prototype.cleanExclusions = function () {
        this._exclusions = null;
    };

    /** @override */
    GGuide.prototype.toString = function () {
        return "[Object GGuide]";
    };

    _.GGuide = GGuide;
})(this);