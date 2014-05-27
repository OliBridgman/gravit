(function (_) {

    /**
     * A vertex class
     * @class IFVertex
     * @constructor
     * @version 1.0
     */
    function IFVertex() {
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFVertex.Command
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A list of vertex commands
     * @see IFVertex.verticeCount
     */
    IFVertex.Command = {
        /**
         * A move command
         * Vertices: [x,y=point]
         * @type {Number}
         */
        Move: 1,

        /**
         * A line command
         * Vertices: [x,y=point]
         * @type {Number}
         */
        Line: 2,

        /**
         * A quadtratic bezier curve command (one control point)
         * Vertices: [x,y=point] [ x,y=control point]
         * @type {Number}
         */
        Curve: 3,

        /**
         * A bezier curve command (two control points)
         * Vertices: [x,y=point] [x,y=control point #1] [x,y=control point #2]
         * @type {Number}
         */
        Curve2: 4,

        /**
         * A close command
         * Vertices: none
         * @type {Number}
         */
        Close: 5
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFVertex Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The command of the vertex
     * @type {Number}
     */
    IFVertex.prototype.command = null;

    /**
     * The x-coordinate of the vertex
     * @type {Number}
     */
    IFVertex.prototype.x = null;

    /**
     * The y-coordinate of the vertex
     * @type {Number}
     */
    IFVertex.prototype.y = null;

    _.IFVertex = IFVertex;
})(this);