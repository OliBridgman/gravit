(function (_) {
    /**
     * Vertex converter that transforms the vertices with a given transformation
     * @class GVertexTransformer
     * @extends GVertexSource
     * @param {GVertexSource} source the underyling vertex source to work on
     * @param {GTransform} [transform] the transformation used to transform the vertices,
     * may be null to set it later on or ignore it
     * @version 1.0
     * @constructor
     */
    function GVertexTransformer(source, transform) {
        this._source = source;
        this._transform = transform;
    }

    GObject.inherit(GVertexTransformer, GVertexSource);

    GVertexTransformer.transformVertex = function (vertex, transform) {
        if (transform) {
            switch (vertex.command) {
                case GVertex.Command.Move:
                case GVertex.Command.Line:
                case GVertex.Command.Curve:
                case GVertex.Command.Curve2:
                    transform.map(vertex);
                    break;
                case GVertex.Command.Close:
                    break;
                default:
                    throw new Error("Unknown vertex command: " + vertex.command.toString());
            }
        }
    };

    /**
     * @type {GVertexSource}
     * @private
     */
    GVertexTransformer.prototype._source = null;

    /**
     * @type {GTransform}
     * @private
     */
    GVertexTransformer.prototype._transform = null;

    /**
     * Get the current transform
     * @return {GTransform}
     * @version 1.0
     */
    GVertexTransformer.prototype.getTransform = function () {
        return this._transform;
    };

    /**
     * Assign a transform
     * @param {GTransform} transform
     * @version 1.0
     */
    GVertexTransformer.prototype.setTransform = function (transform) {
        this._transform = transform;
    };

    /** @override */
    GVertexTransformer.prototype.rewindVertices = function (index) {
        return this._source.rewindVertices(index);
    };

    /** override */
    GVertexTransformer.prototype.readVertex = function (vertex) {
        if (this._source.readVertex(vertex)) {
            GVertexTransformer.transformVertex(vertex, this._transform);
            return true;
        }
        return false;
    };

    /** @override */
    GVertexTransformer.prototype.toString = function () {
        return "[Object GVertexTransformer]";
    };

    _.GVertexTransformer = GVertexTransformer;
})(this);