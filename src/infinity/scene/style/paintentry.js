(function (_) {

    /**
     * A base for vector paintings
     * @class IFPaintEntry
     * @extends IFStyleEntry
     * @constructor
     */
    function IFPaintEntry() {
        IFStyleEntry.call(this);
    }

    IFObject.inherit(IFPaintEntry, IFStyleEntry);

    /**
     * Called to test on whether this paint requires to paint
     * itself on a separate canvas or not
     * @returns {boolean}
     */
    IFPaintEntry.prototype.isSeparate = function () {
        return false;
    };

    /**
     * Called whenever a hit-test should be made on this paint entry.
     * @parma {IFVertexSource} source the vertice source
     * @param {GPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {GTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Number} tolerance a tolerance value for hit testing in view coordinates
     * @returns {IFStyle.HitResult} the hit result or null for none
     */
    IFPaintEntry.prototype.hitTest = function (source, location, transform, tolerance) {
        return null;
    };

    /**
     * Called to paint. Note that the given canvas is already
     * pre-filled with the given vertex source.
     * @param {IFPaintCanvas} canvas the canvas used for painting
     * @param {IFVertexSource} source the vertex source used for painting
     */
    IFPaintEntry.prototype.paint = function (canvas, source) {
        throw new Error("Not Supported");
    };

    /** @override */
    IFPaintEntry.prototype.toString = function () {
        return "[IFPaintEntry]";
    };

    _.IFPaintEntry = IFPaintEntry;
})(this);