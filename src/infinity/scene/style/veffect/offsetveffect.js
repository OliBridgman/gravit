(function (_) {

    /**
     * A vector effect for offsetting
     * @class IFOffsetVEffect
     * @extends IFVEffectEntry
     * @constructor
     */
    function IFOffsetVEffect() {
        IFVEffectEntry.call(this);
        this._setDefaultProperties(IFOffsetVEffect.GeometryProperties);
    }

    IFNode.inheritAndMix('offsetVEffect', IFOffsetVEffect, IFVEffectEntry);

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
            // TODO : Right now we don't know whether we'll expand or inset as this depends
            // on our path's direction so we'll always expand by default to cover any case
            //var val = this.$tp === IFOffsetVEffect.OffsetType.Inset ? -this.$off : this.$off;
            var val = this.$off;
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
                this.$tp === IFOffsetVEffect.OffsetType.Inset || this.$tp === IFOffsetVEffect.OffsetType.Both,
                this.$tp === IFOffsetVEffect.OffsetType.Outset || this.$tp === IFOffsetVEffect.OffsetType.Both
            );
        }
        return source;
    };

    /** @override */
    IFOffsetVEffect.prototype.store = function (blob) {
        if (IFVEffectEntry.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFOffsetVEffect.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFOffsetVEffect.prototype.restore = function (blob) {
        if (IFVEffectEntry.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFOffsetVEffect.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFOffsetVEffect.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFOffsetVEffect.GeometryProperties);
        IFVEffectEntry.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFOffsetVEffect.prototype.toString = function () {
        return "[IFOffsetVEffect]";
    };

    _.IFOffsetVEffect = IFOffsetVEffect;
})(this);