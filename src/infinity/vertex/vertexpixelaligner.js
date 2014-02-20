(function (_) {
    /**
     * Vertex converter that transforms the vertices so that they align with the pixel grid
     * which basically is Math.floor(vertex) + 0.5
     * @class GXVertexPixelAligner
     * @extends GXVertexSource
     * @param {GXVertexSource} source the underyling vertex source to work on
     * @version 1.0
     * @constructor
     */
    function GXVertexPixelAligner(source) {
        this._source = source;
    }

    GObject.inherit(GXVertexPixelAligner, GXVertexSource);

    /**
     * @type {GXVertexSource}
     * @private
     */
    GXVertexPixelAligner.prototype._source = null;

    /** @override */
    GXVertexPixelAligner.prototype.rewindVertices = function (index) {
        return this._source.rewindVertices(index);
    };

    /** override */
    GXVertexPixelAligner.prototype.readVertex = function (vertex) {
        if (this._source.readVertex(vertex)) {
            if (vertex.command >= GXVertex.Command.Move && vertex.command < GXVertex.Command.Close) {
                vertex.x = Math.floor(vertex.x) + 0.5;
                vertex.y = Math.floor(vertex.y) + 0.5;
            }
            return true;
        }
        return false;
    };

    /** @override */
    GXVertexPixelAligner.prototype.toString = function () {
        return "[Object GXVertexPixelAligner]";
    };

    _.GXVertexPixelAligner = GXVertexPixelAligner;
})(this);