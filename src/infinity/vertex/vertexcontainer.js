(function (_) {

    /**
     * A container for vertices
     * @class IFVertexContainer
     * @mixes IFVertexSource
     * @mixes IFVertexTarget
     * @constructor
     */
    function IFVertexContainer() {
        this._vertices = [];
    }

    GObject.mix(IFVertexContainer, [IFVertexSource, IFVertexTarget]);

    /**
     * @type {number}
     * @private
     */
    IFVertexContainer.prototype._index = 0;

    /**
     * @type {Array{{c:Number, x:Number, y:Nuber}}}
     * @private
     */
    IFVertexContainer.prototype._vertices = null;

    /** @override */
    IFVertexContainer.prototype.addVertex = function (command, x, y) {
        this._vertices.push({
            c : command,
            x : x,
            y : y
        });
        this._index = this._vertices.length + 1;;
    };

    /** @override */
    IFVertexContainer.prototype.clearVertices = function () {
        this._vertices = [];
    };

    /**
     * Transform all vertices in this container with a given matrix
     * @param {GTransform} transform
     */
    IFVertexContainer.prototype.transformVertices = function (transform) {
        for (var i = 0; i < this._vertices.length; ++i) {
            transform.map(this._vertices[i]);
        }
    };

    /**
     * @returns {Number} the total number of vertices in this container
     * @version 1.0
     */
    IFVertexContainer.prototype.getCount = function () {
        return this._vertices.length;
    };

    /** @override */
    IFVertexContainer.prototype.rewindVertices = function (index) {
        if (index >= 0 && index <= this._vertices.length) {
            this._index = index;
            return true;
        }
        return false;
    };

    /** @override */
    IFVertexContainer.prototype.readVertex = function (vertex) {
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
    IFVertexContainer.prototype.toString = function () {
        return "[Object IFVertexContainer]";
    };

    _.IFVertexContainer = IFVertexContainer;
})(this);