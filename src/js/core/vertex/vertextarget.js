(function (_) {

    /**
     * A target of vertices
     * @class GVertexTarget
     * @mixin
     * @constructor
     * @version 1.0
     */
    function GVertexTarget() {
    }

    /**
     * Add a new vertex to the end of this target
     * @param {Number} command the command of the vertex
     * @param {Number} [x] x-coordinate of vertex, defaults to 0
     * @param {Number} [y] y-coordinate of vertex, defaults to 0
     */
    GVertexTarget.prototype.addVertex = function (command, x, y) {
        throw new Error("Not Supported");
    }

    /**
     * Append another vertex source to this one
     * @param {GVertexSource} source the source to append to this one
     * @param {Number} [index] optional index to start reading from source, defaults to 0
     */
    GVertexTarget.prototype.appendVertices = function (source, index) {
        if (source.rewindVertices(index ? index : 0)) {
            var vertex = new GVertex();
            while (source.readVertex(vertex)) {
                this.addVertex(vertex.command, vertex.x, vertex.y);
            }
        }
    }

    /**
     * Clear all vertices in this target
     * @version 1.0
     */
    GVertexTarget.prototype.clearVertices = function () {
        throw new Error('Not Supported.');
    }

    /** @override */
    GVertexTarget.prototype.toString = function () {
        return "[Object GVertexTarget]";
    }

    _.GVertexTarget = GVertexTarget;
})(this);