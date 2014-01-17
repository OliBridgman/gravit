(function (_) {
    /**
     * Vertex converter that transforms the vertices with a given transformation
     * @class GXVertexTransformer
     * @extends GXVertexSource
     * @param {GXVertexSource} source the underyling vertex source to work on
     * @param {GTransform} [transform] the transformation used to transform the vertices,
     * may be null to set it later on or ignore it
     * @version 1.0
     * @constructor
     */
    function GXVertexTransformer(source, transform) {
        this._source = source;
        this._transform = transform;
    }

    GObject.inherit(GXVertexTransformer, GXVertexSource);

    GXVertexTransformer.transformVertex = function (vertex, transform) {
        if (transform) {
            switch (vertex.command) {
                case GXVertex.Command.Move:
                case GXVertex.Command.Line:
                case GXVertex.Command.Curve:
                case GXVertex.Command.Curve2:
                    transform.map(vertex);
                    break;
                case GXVertex.Command.Close:
                    break;
                default:
                    throw new Error("Unknown vertex command: " + vertex.command.toString());
            }
        }
    };

    /**
     * @type {GXVertexSource}
     * @private
     */
    GXVertexTransformer.prototype._source = null;

    /**
     * @type {GTransform}
     * @private
     */
    GXVertexTransformer.prototype._transform = null;

    /**
     * Get the current transform
     * @return {GTransform}
     * @version 1.0
     */
    GXVertexTransformer.prototype.getTransform = function () {
        return this._transform;
    };

    /**
     * Assign a transform
     * @param {GTransform} transform
     * @version 1.0
     */
    GXVertexTransformer.prototype.setTransform = function (transform) {
        this._transform = transform;
    };

    /** @override */
    GXVertexTransformer.prototype.rewindVertices = function (index) {
        return this._source.rewindVertices(index);
    };

    /** override */
    GXVertexTransformer.prototype.readVertex = function (vertex) {
        if (this._source.readVertex(vertex)) {
            GXVertexTransformer.transformVertex(vertex, this._transform);
            return true;
        }
        return false;
    };

    /** @override */
    GXVertexTransformer.prototype.toString = function () {
        return "[Object GXVertexTransformer]";
    };

    _.GXVertexTransformer = GXVertexTransformer;
})(this);