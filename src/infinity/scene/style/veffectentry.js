(function (_) {

    /**
     * A base for vector effects
     * @class IFVEffectEntry
     * @extends IFStyleEntry
     * @constructor
     */
    function IFVEffectEntry() {
        IFStyleEntry.call(this);
    }

    IFObject.inherit(IFVEffectEntry, IFStyleEntry);

    /**
     * @param {IFVertexSource} source the source vertices this
     * filter should be applied to
     * @return {IFVertexSource} a new vertex source with the
     * vector effect applied
     */
    IFVEffectEntry.prototype.createEffect = function (source) {
        throw new Error("Not Supported");
    };

    /** @override */
    IFVEffectEntry.prototype.toString = function () {
        return "[IFVEffectEntry]";
    };

    _.IFVEffectEntry = IFVEffectEntry;
})(this);