(function (_) {

    /**
     * A target of vertices
     * @class GXVertexTarget
     * @mixin
     * @constructor
     * @version 1.0
     */
    function GXVertexTarget() {
    }

    /**
     * Add a new vertex to the end of this target
     * @param {Number} command the command of the vertex
     * @param {Number} [x] x-coordinate of vertex, defaults to 0
     * @param {Number} [y] y-coordinate of vertex, defaults to 0
     * @return {Number} the index of the new vertex
     */
    GXVertexTarget.prototype.addVertex = function (command, x, y) {
        throw new Error("Not Supported");
    }

    /**
     * Append another vertex source to this one
     * @param {GXVertexSource} source the source to append to this one
     * @param {Number} [index] optional index to start reading from source, defaults to 0
     */
    GXVertexTarget.prototype.appendVertices = function (source, index) {
        if (source.rewindVertices(index ? index : 0)) {
            var vertex = new GXVertex();
            while (source.readVertex(vertex)) {
                this.addVertex(vertex.command, vertex.x, vertex.y);
            }
        }
    }

    /**
     * Clear all vertices in this target
     * @version 1.0
     */
    GXVertexTarget.prototype.clearVertices = function () {
        this.resize(0);
    }

    /** @override */
    GXVertexTarget.prototype.toString = function () {
        return "[Object GXVertexTarget]";
    }

    _.GXVertexTarget = GXVertexTarget;
})(this);