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
        this._setDefaultProperties(IFEffect.VisualProperties);
    };
    IFObject.inheritAndMix(IFEffect, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * Visual properties of an effect
     */
    IFEffect.VisualProperties = {
        'vs': true,
        'ly': null
    };

    /** @override */
    IFEffect.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFStylable.Effects;
    };

    /** @override */
    IFEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFEffect.VisualProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFEffect.VisualProperties);
        }

        IFNode.prototype._handleChange.call(this, change, args);
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
     * @param {IFPaintContext} context
     */
    IFEffect.prototype.render = function (context) {
        // NO-OP
    };

    /** @override */
    IFEffect.prototype.toString = function () {
        return "[Object IFEffect]";
    };

    _.IFEffect = IFEffect;
})(this);