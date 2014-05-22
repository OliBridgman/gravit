(function (_) {
    /**
     * Vertex converter that transforms the vertices so that they align with the pixel grid
     * which basically is Math.floor(vertex) + 0.5
     * @class IFVertexPixelAligner
     * @extends IFVertexSource
     * @param {IFVertexSource} source the underyling vertex source to work on
     * @version 1.0
     * @constructor
     */
    function IFVertexPixelAligner(source) {
        this._source = source;
    }

    GObject.inherit(IFVertexPixelAligner, IFVertexSource);

    /**
     * @type {IFVertexSource}
     * @private
     */
    IFVertexPixelAligner.prototype._source = null;

    /** @override */
    IFVertexPixelAligner.prototype.rewindVertices = function (index) {
        return this._source.rewindVertices(index);
    };

    /** override */
    IFVertexPixelAligner.prototype.readVertex = function (vertex) {
        if (this._source.readVertex(vertex)) {
            if (vertex.command >= IFVertex.Command.Move && vertex.command < IFVertex.Command.Close) {
                vertex.x = Math.floor(vertex.x) + 0.5;
                vertex.y = Math.floor(vertex.y) + 0.5;
            }
            return true;
        }
        return false;
    };

    /** @override */
    IFVertexPixelAligner.prototype.toString = function () {
        return "[Object IFVertexPixelAligner]";
    };

    _.IFVertexPixelAligner = IFVertexPixelAligner;
})(this);