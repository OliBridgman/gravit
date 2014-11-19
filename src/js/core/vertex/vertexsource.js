(function (_) {

    /**
     * A source of vertices
     * @class GVertexSource
     * @mixin
     * @constructor
     * @version 1.0
     */
    function GVertexSource() {
    }

    /**
     * Rewind to a given index to read from there
     * @param {Number} index the index to rewind to
     * @return {Boolean} true if rewinded to the given index,
     * false otherwise i.e. if index is out of range
     * @version 1.0
     */
    GVertexSource.prototype.rewindVertices = function (index) {
        return false;
    }

    /**
     * Read a vertex at the current index and increases the current index
     * to go to the next vertex on the next read
     * @param {GVertex} vertex the vertex to read into
     * @return {Boolean} true if a vertex could be read, false otherwise,
     * i.e. if the end is already reached.
     * @version 1.0
     */
    GVertexSource.prototype.readVertex = function (vertex) {
        return false;
    }

    /** @override */
    GVertexSource.prototype.toString = function () {
        return "[Object GVertexSource]";
    }

    _.GVertexSource = GVertexSource;
})(this);