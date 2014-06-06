(function (_) {

    /**
     * A vector effect for offsetting
     * @class IFOffsetVEffect
     * @extends IFVEffectEntry
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFOffsetVEffect() {
        IFVEffectEntry.call(this);
        this._setDefaultProperties(IFOffsetVEffect.GeometryProperties);
    }

    IFNode.inheritAndMix('offsetVEffect', IFOffsetVEffect, IFVEffectEntry, [IFNode.Properties]);

    /**
     * Type of offset
     * @enum
     */
    IFOffsetVEffect.OffsetType = {
        Inset: 'i',
        Outset:' o',
        Both: 'b'
    };

    /**
     * Geometry properties
     */
    IFOffsetVEffect.GeometryProperties = {
        // Offset-Type
        tp: IFOffsetVEffect.OffsetType.Outset,
        // The offset amount
        off: 5
    };

    /** @override */
    IFOffsetVEffect.prototype.getPadding = function () {
        if (this.$off > 0) {
            var val = this.$tp === IFOffsetVEffect.OffsetType.Inset ? -this.$off : this.$off;
            return [val, val, val, val];
        }
        return null;
    };

    /** @override */
    IFOffsetVEffect.prototype.createEffect = function (source) {
        if (this.$off > 0) {
            return new IFVertexOffsetter(
                source,
                this.$off,
                this.$tp === IFOffsetVEffect.OffsetType.Outset || this.$tp === IFOffsetVEffect.OffsetType.Both,
                this.$tp === IFOffsetVEffect.OffsetType.Inset || this.$tp === IFOffsetVEffect.OffsetType.Both
            );
        }
        return source;
    };

    /** @override */
    IFOffsetVEffect.prototype.toString = function () {
        return "[IFOffsetVEffect]";
    };

    _.IFOffsetVEffect = IFOffsetVEffect;
})(this);