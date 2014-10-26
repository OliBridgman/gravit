(function (_) {
    /**
     * Vertex converter that transforms the vertices so that they align with the pixel grid
     * which basically is Math.floor(vertex) + 0.5
     * @class GVertexPixelAligner
     * @extends GVertexSource
     * @param {GVertexSource} source the underyling vertex source to work on
     * @version 1.0
     * @constructor
     */
    function GVertexPixelAligner(source) {
        this._source = source;
    }

    GObject.inherit(GVertexPixelAligner, GVertexSource);

    /**
     * @type {GVertexSource}
     * @private
     */
    GVertexPixelAligner.prototype._source = null;

    /** @override */
    GVertexPixelAligner.prototype.rewindVertices = function (index) {
        return this._source.rewindVertices(index);
    };

    /** override */
    GVertexPixelAligner.prototype.readVertex = function (vertex) {
        if (this._source.readVertex(vertex)) {
            if (vertex.command >= GVertex.Command.Move && vertex.command < GVertex.Command.Close) {
                vertex.x = Math.floor(vertex.x) + 0.5;
                vertex.y = Math.floor(vertex.y) + 0.5;
            }
            return true;
        }
        return false;
    };

    /** @override */
    GVertexPixelAligner.prototype.toString = function () {
        return "[Object GVertexPixelAligner]";
    };

    _.GVertexPixelAligner = GVertexPixelAligner;
})(this);