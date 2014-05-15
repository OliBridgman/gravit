(function (_) {

    /**
     * A container for vertices
     * @class GXVertexContainer
     * @mixes GXVertexSource
     * @mixes GXVertexTarget
     * @constructor
     */
    function GXVertexContainer() {
        this._vertices = [];
    }

    GObject.mix(GXVertexContainer, [GXVertexSource, GXVertexTarget]);

    /**
     * @type {number}
     * @private
     */
    GXVertexContainer.prototype._index = 0;

    /**
     * @type {Array{{c:Number, x:Number, y:Nuber}}}
     * @private
     */
    GXVertexContainer.prototype._vertices = null;

    /** @override */
    GXVertexContainer.prototype.addVertex = function (command, x, y) {
        this._vertices.push({
            c : command,
            x : x,
            y : y
        });
        this._index = this._vertices.length + 1;;
    };

    /** @override */
    GXVertexContainer.prototype.clearVertices = function () {
        this._vertices = [];
    };

    /**
     * @returns {Number} the total number of vertices in this container
     * @version 1.0
     */
    GXVertexContainer.prototype.getCount = function () {
        return this._vertices.length;
    };

    /** @override */
    GXVertexContainer.prototype.rewindVertices = function (index) {
        if (index >= 0 && index <= this._vertices.length) {
            this._index = index;
            return true;
        }
        return false;
    };

    /** @override */
    GXVertexContainer.prototype.readVertex = function (vertex) {
        if (this._index >= 0 && this._index < this._vertices.length) {
            var v = this._vertices[this._index];
            vertex.command = v.c;
            vertex.x = v.x;
            vertex.y = v.y;
            this._index++;
            return true;
        }
        return false;
    };

    /** @override */
    GXVertexContainer.prototype.toString = function () {
        return "[Object GXVertexContainer]";
    };

    _.GXVertexContainer = GXVertexContainer;
})(this);