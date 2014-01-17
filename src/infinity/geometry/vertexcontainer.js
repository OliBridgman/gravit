(function (_) {

    /**
     * A container for vertices
     * @param {Number} [count] given number of expected vertices, defaults to 0
     * @class GXVertexContainer
     * @mixes GXVertexSource
     * @mixes GXVertexTarget
     * @constructor
     * @version 1.0
     */
    function GXVertexContainer(count) {
        if (count) {
            this.resize(count);
        }
    }

    GObject.mix(GXVertexContainer, [GXVertexSource, GXVertexTarget]);

    /**
     * @type {number}
     * @private
     */
    GXVertexContainer.prototype._index = 0;

    /**
     * @type {Int8Array}
     * @private
     */
    GXVertexContainer.prototype._commands = null;

    /**
     * @type {Float64Array}
     * @private
     */
    GXVertexContainer.prototype._vertices = null;

    /** @override */
    GXVertexContainer.prototype.addVertex = function (command, x, y) {
        var index = this.getCount();
        this.resize(index + 1);
        this.modifyVertex(command, x ? x : 0, y ? y : 0, index);
        return index;
    };

    /**
     * Modify a vertex at a given index
     * @param {Number} [command] the command of the vertex, if not provided
     * or null then defaults to the command at the given index
     * @param {Number} [x] x-coordinate of vertex, if not provided
     * or null then defaults to the x-coordinate at the given index
     * @param {Number} [y] y-coordinate of vertex, if not provided
     * or null then defaults to the y-coordinate at the given index
     * @param {Number} index the index to modify at, if not provided or null
     * then defaults to the current index
     * @version 1.0
     */
    GXVertexContainer.prototype.modifyVertex = function (command, x, y, index) {
        if (typeof index != "number") {
            index = this._index;
        }
        if (index < 0 || index >= this.getCount()) {
            throw new Error("Index out of range.");
        }
        if (typeof command == "number") {
            this._commands[index] = command;
        }
        index *= 2;
        if (typeof x == "number") {
            this._vertices[index] = x;
        }
        if (typeof y == "number") {
            this._vertices[index + 1] = y;
        }
    };

    /**
     * Write a vertex at the current index and increase the current index
     * @param {Number} [command] the command of the vertex, if not provided
     * or null then defaults to the command at the current index
     * @param {Number} [x] x-coordinate of vertex, if not provided
     * or null then defaults to the x-coordinate at the current index
     * @param {Number} [y] y-coordinate of vertex, if not provided
     * or null then defaults to the y-coordinate at the current index
     */
    GXVertexContainer.prototype.writeVertex = function (command, x, y) {
        if (this._index < 0 || this._index >= this.getCount()) {
            throw new Error("Index out of range.");
        }
        this._index++;
        this.modifyVertex(command, x, y, this._index - 1);
    };

    /** @override */
    GXVertexContainer.prototype.clearVertices = function () {
        this.resize(0);
    };

    /**
     * Resize this container
     * @param {Number} count the new number of vertices this container should hold.
     * If this is zero, everything is cleared.
     * @version 1.0
     */
    GXVertexContainer.prototype.resize = function (count) {
        if (count <= 0) {
            this._commands = null;
            this._vertices = null;
        } else {
            var commands = this._commands;
            var vertices = this._vertices;

            this._commands = new Int8Array(count);
            this._vertices = new Float64Array(count * 2);

            if (commands) {
                if (commands.length == this._commands.length) {
                    this._commands.set(commands);
                } else {
                    this._commands.set(commands.subarray(0, Math.min(commands.length, this._commands.length)));
                }
            }

            if (vertices) {
                if (vertices.length == this._vertices.length) {
                    this._vertices.set(vertices);
                } else {
                    this._vertices.set(vertices.subarray(0, Math.min(vertices.length, this._vertices.length)));
                }
            }
        }
    };

    /**
     * @returns {Number} the total number of vertices in this container
     * @version 1.0
     */
    GXVertexContainer.prototype.getCount = function () {
        return this._commands ? this._commands.length : 0;
    };

    /**
     * @returns {Number} the current index in this container
     * @version 1.0
     */
    GXVertexContainer.prototype.getIndex = function () {
        return this._index;
    };

    /** @override */
    GXVertexContainer.prototype.rewindVertices = function (index) {
        if (index >= 0 && index <= this.getCount()) {
            this._index = index;
            return true;
        }
        return false;
    };

    /**
     * Read a vertex at a specific index
     * @param {Number} index the index to read a vertex from
     * @param {GXVertex} vertex the vertex to read into
     * @return {Boolean} true if a vertex could be read, false otherwise,
     * i.e. if the index is out of range
     * @version 1.0
     */
    GXVertexContainer.prototype.getVertex = function (index, vertex) {
        if (index >= 0 && index < this.getCount()) {
            vertex.command = this._commands[index]
            index *= 2;
            vertex.x = this._vertices[index];
            vertex.y = this._vertices[index + 1];
            return true;
        }
        return false;
    };

    /** @override */
    GXVertexContainer.prototype.readVertex = function (vertex) {
        if (this._index >= 0 && this._index < this.getCount()) {
            this._index++;
            return this.getVertex(this._index - 1, vertex);
        }
        return false;
    };

    /** @override */
    GXVertexContainer.prototype.toString = function () {
        return "[Object GXVertexContainer]";
    };

    _.GXVertexContainer = GXVertexContainer;
})(this);