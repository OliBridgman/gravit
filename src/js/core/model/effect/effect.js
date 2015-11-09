(function (_) {
    /**
     * Base effect class
     * @class GEffect
     * @extends GNode
     * @mixes GNode.Store
     * @mixes GNode.Properties
     * @constructor
     */
    GEffect = function () {
        this._setDefaultProperties(GEffect.GeometryProperties);
    };
    GObject.inheritAndMix(GEffect, GNode, [GNode.Store, GNode.Properties]);

    /**
     * Type of an effect
     * @enum
     */
    GEffect.Type = {
        /**
         * Effect painted before the content and not
         * modifying the content itself
         */
        PreEffect: 0,

        /**
         * Effect painted after the content and not
         * modifying the content itself
         */
        PostEffect: 1,

        /**
         * Filter applied to contents
         */
        Filter: 2
    };

    /**
     * Geometry properties of an effect
     */
    GEffect.GeometryProperties = {
        /** Visibility of the effect */
        'vs': true,
        /** The layer (String) this applies to */
        'ly': null
    };

    /**
     * @return {GEffect.Type}
     */
    GEffect.prototype.getEffectType = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Return any additional padding this effect requires.
     * @return {Array|Number} left,top,right,bottom or one for all
     * or null for none
     */
    GEffect.prototype.getEffectPadding = function () {
        return null;
    };

    /**
     * Render this effect
     * @param {GPaintCanvas} contents canvas holding the painted contents.
     * If this is a filter effect it should apply to contents, otherwise
     * it should not modify the contents and put results on the output
     * @param {GPaintCanvas} output the canvas to put the effect result onto.
     * This is null if this effect is a filter effect.
     * @param {GPaintCanvas} background the background canvas
     * @param {Number} scale the scaling factor used
     * @return {GPaintCanvas.BlendMode} a blend-mode for blending output
     * into the contents. This is only honored when this effect's type
     * is actually set to GEffect.Type.PostEffect
     */
    GEffect.prototype.render = function (contents, output, background, scale) {
        // NO-OP
    };

    /** @override */
    GEffect.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GStylable.Effects;
    };

    /** @override */
    GEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GEffect.GeometryProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GEffect.GeometryProperties);
        }

        this._handleGeometryChangeForProperties(change, args, GEffect.GeometryProperties);

        GNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * Return the owner stylable if any
     * @returns {GStylable}
     */
    GEffect.prototype.getOwnerStylable = function () {
        var effects = this.getParent();
        if (effects && effects instanceof GStylable.Effects) {
            var stylable = effects.getParent();
            if (stylable && stylable.hasMixin(GStylable)) {
                return stylable;
            }
        }
        return null;
    };


    /**
     * This will fire a change event for geometry updates whenever a given
     * geometry property has been changed. This is usually called from the
     * _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * geometrical changes
     * @return {Boolean} true if there was a property change that affected a
     * change of the geometry
     * @private
     */
    GEffect.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        if (change == GNode._Change.BeforePropertiesChange || change == GNode._Change.AfterPropertiesChange) {
            if (GUtil.containsObjectKey(args.properties, properties)) {
                var stylable = this.getOwnerStylable();
                if (stylable) {
                    switch (change) {
                        case GNode._Change.BeforePropertiesChange:
                            stylable._stylePrepareGeometryChange(true);
                            break;
                        case GNode._Change.AfterPropertiesChange:
                            stylable._styleFinishGeometryChange(true);
                            break;
                    }
                }
                return true;
            }
        }
        return false;
    };

    /**
     * This will fire an invalidation event for visual updates whenever a given
     * visual property has been changed. This is usually called from the
     * _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * visual changes
     * @return {Boolean} true if there was a property change that affected a
     * visual change
     * @private
     */
    GEffect.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        if (change == GNode._Change.AfterPropertiesChange) {
            if (GUtil.containsObjectKey(args.properties, properties)) {
                var stylable = this.getOwnerStylable();
                if (stylable) {
                    stylable._styleRepaint();
                }
                return true;
            }
        }
        return false;
    };

    /** @override */
    GEffect.prototype.toString = function () {
        return "[Object GEffect]";
    };

    _.GEffect = GEffect;
})(this);