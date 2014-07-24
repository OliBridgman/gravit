(function (_) {
    /**
     * Vertex converter that transforms the vertices with a given transformation
     * @class IFVertexTransformer
     * @extends IFVertexSource
     * @param {IFVertexSource} source the underyling vertex source to work on
     * @param {IFTransform} [transform] the transformation used to transform the vertices,
     * may be null to set it later on or ignore it
     * @version 1.0
     * @constructor
     */
    function IFVertexTransformer(source, transform) {
        this._source = source;
        this._transform = transform;
    }

    IFObject.inherit(IFVertexTransformer, IFVertexSource);

    IFVertexTransformer.transformVertex = function (vertex, transform) {
        if (transform) {
            switch (vertex.command) {
                case IFVertex.Command.Move:
                case IFVertex.Command.Line:
                case IFVertex.Command.Curve:
                case IFVertex.Command.Curve2:
                    transform.map(vertex);
                    break;
                case IFVertex.Command.Close:
                    break;
                default:
                    throw new Error("Unknown vertex command: " + vertex.command.toString());
            }
        }
    };

    /**
     * @type {IFVertexSource}
     * @private
     */
    IFVertexTransformer.prototype._source = null;

    /**
     * @type {IFTransform}
     * @private
     */
    IFVertexTransformer.prototype._transform = null;

    /**
     * Get the current transform
     * @return {IFTransform}
     * @version 1.0
     */
    IFVertexTransformer.prototype.getTransform = function () {
        return this._transform;
    };

    /**
     * Assign a transform
     * @param {IFTransform} transform
     * @version 1.0
     */
    IFVertexTransformer.prototype.setTransform = function (transform) {
        this._transform = transform;
    };

    /** @override */
    IFVertexTransformer.prototype.rewindVertices = function (index) {
        return this._source.rewindVertices(index);
    };

    /** override */
    IFVertexTransformer.prototype.readVertex = function (vertex) {
        if (this._source.readVertex(vertex)) {
            IFVertexTransformer.transformVertex(vertex, this._transform);
            return true;
        }
        return false;
    };

    /** @override */
    IFVertexTransformer.prototype.toString = function () {
        return "[Object IFVertexTransformer]";
    };

    _.IFVertexTransformer = IFVertexTransformer;
})(this);