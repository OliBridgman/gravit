(function (_) {
    /**
     * The lasso select tool
     * @class IFLassoTool
     * @extends IFMarqueeTool
     * @constructor
     */
    function IFLassoTool() {
        IFMarqueeTool.call(this, new IFLassoTool._AreaSelector());
    };

    IFObject.inherit(IFLassoTool, IFMarqueeTool);

    // -----------------------------------------------------------------------------------------------------------------
    // IFLassoTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFLassoTool._AreaSelector
     * @extends IFMarqueeTool._AreaSelector
     * @private
     */
    IFLassoTool._AreaSelector = function () {
        IFMarqueeTool._AreaSelector.call(this);
    };
    IFObject.inherit(IFLassoTool._AreaSelector, IFMarqueeTool._AreaSelector);

    /**
     * @type {IFPoint}
     * @private
     */
    IFLassoTool._AreaSelector.prototype._current = null;

    /** @override */
    IFLassoTool._AreaSelector.prototype.start = function (pos) {
        this._current = null;
    };

    /** @override */
    IFLassoTool._AreaSelector.prototype.move = function (pos) {
        if (this._current == null || Math.abs(pos.getX() - this._current.getX()) >= 3 || Math.abs(pos.getY() - this._current.getY()) >= 3) {
            this._vertexContainer.addVertex(this._vertexContainer.getCount() == 0 ? IFVertex.Command.Move : IFVertex.Command.Line, pos.getX(), pos.getY());
            this._current = pos;
        }
    };

    /** @override */
    IFLassoTool.prototype.getCursor = function () {
        return IFCursor.Lasso;
    };

    /** override */
    IFLassoTool.prototype.toString = function () {
        return "[Object IFLassoTool]";
    };

    _.IFLassoTool = IFLassoTool;
})(this);