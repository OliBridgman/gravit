(function (_) {
    /**
     * Base effect class
     * @class IFEffect
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    IFEffect = function () {
        this._setDefaultProperties(IFEffect.GeometryProperties);
    };
    IFObject.inheritAndMix(IFEffect, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * Type of an effect
     * @enum
     */
    IFEffect.Type = {
        /**
         * Effect painted before the content and not
         * modifying the content itself
         */
        PreEffect : 0,

        /**
         * Effect painted after the content and not
         * modifying the content itself
         */
        PostEffect : 1,

        /**
         * Filter applied to contents
         */
        Filter : 2
    };

    /**
     * Geometry properties of an effect
     */
    IFEffect.GeometryProperties = {
        /** Visibility of the effect */
        'vs': true,
        /** The layer (IFStylable.Layer) this applies to */
        'ly': null
    };

    /**
     * @return {IFEffect.Type}
     */
    IFEffect.prototype.getEffectType = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Return any additional padding this effect requires.
     * @return {Array|Number} left,top,right,bottom or one for all
     * or null for none
     */
    IFEffect.prototype.getEffectPadding = function () {
        return null;
    };

    /**
     * Render this effect
     * @param {IFPaintCanvas} contents canvas holding the painted contents.
     * If this is a filter effect it should apply to contents, otherwise
     * it should not modify the contents and put results on the output
     * @param {IFPaintCanvas} output the canvas to put the effect result onto.
     * This is null if this effect is a filter effect.
     * @param {IFPaintCanvas} background the background canvas
     * @param {Number} scale the scaling factor used
     * @return {IFPaintCanvas.BlendMode} a blend-mode for blending output
     * into the contents. This is only honored when this effect's type
     * is actually set to IFEffect.Type.PostEffect
     */
    IFEffect.prototype.render = function (contents, output, background, scale) {
        // NO-OP
    };

    /** @override */
    IFEffect.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFStylable.Effects;
    };

    /** @override */
    IFEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFEffect.GeometryProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFEffect.GeometryProperties);
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFEffect.prototype.toString = function () {
        return "[Object IFEffect]";
    };

    _.IFEffect = IFEffect;
})(this);