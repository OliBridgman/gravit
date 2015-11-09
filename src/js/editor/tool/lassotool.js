(function (_) {
    /**
     * The lasso select tool
     * @class GLassoTool
     * @extends GMarqueeTool
     * @constructor
     */
    function GLassoTool() {
        GMarqueeTool.call(this, new GLassoTool._AreaSelector());
    };

    GObject.inherit(GLassoTool, GMarqueeTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GLassoTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GLassoTool._AreaSelector
     * @extends GMarqueeTool._AreaSelector
     * @private
     */
    GLassoTool._AreaSelector = function () {
        GMarqueeTool._AreaSelector.call(this);
    };
    GObject.inherit(GLassoTool._AreaSelector, GMarqueeTool._AreaSelector);

    /**
     * @type {GPoint}
     * @private
     */
    GLassoTool._AreaSelector.prototype._current = null;

    /** @override */
    GLassoTool._AreaSelector.prototype.start = function (pos) {
        this._current = null;
    };

    /** @override */
    GLassoTool._AreaSelector.prototype.move = function (pos) {
        if (this._current == null || Math.abs(pos.getX() - this._current.getX()) >= 3 || Math.abs(pos.getY() - this._current.getY()) >= 3) {
            this._vertexContainer.addVertex(this._vertexContainer.getCount() == 0 ? GVertex.Command.Move : GVertex.Command.Line, pos.getX(), pos.getY());
            this._current = pos;
        }
    };

    /** @override */
    GLassoTool.prototype.getCursor = function () {
        return GCursor.Lasso;
    };

    /** override */
    GLassoTool.prototype.toString = function () {
        return "[Object GLassoTool]";
    };

    _.GLassoTool = GLassoTool;
})(this);