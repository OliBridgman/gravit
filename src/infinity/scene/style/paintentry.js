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