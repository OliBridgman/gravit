(function (_) {

    /**
     * A target of vertices
     * @class IFVertexTarget
     * @mixin
     * @constructor
     * @version 1.0
     */
    function IFVertexTarget() {
    }

    /**
     * Add a new vertex to the end of this target
     * @param {Number} command the command of the vertex
     * @param {Number} [x] x-coordinate of vertex, defaults to 0
     * @param {Number} [y] y-coordinate of vertex, defaults to 0
     */
    IFVertexTarget.prototype.addVertex = function (command, x, y) {
        throw new Error("Not Supported");
    }

    /**
     * Append another vertex source to this one
     * @param {IFVertexSource} source the source to append to this one
     * @param {Number} [index] optional index to start reading from source, defaults to 0
     */
    IFVertexTarget.prototype.appendVertices = function (source, index) {
        if (source.rewindVertices(index ? index : 0)) {
            var vertex = new IFVertex();
            while (source.readVertex(vertex)) {
                this.addVertex(vertex.command, vertex.x, vertex.y);
            }
        }
    }

    /**
     * Clear all vertices in this target
     * @version 1.0
     */
    IFVertexTarget.prototype.clearVertices = function () {
        throw new Error('Not Supported.');
    }

    /** @override */
    IFVertexTarget.prototype.toString = function () {
        return "[Object IFVertexTarget]";
    }

    _.IFVertexTarget = IFVertexTarget;
})(this);