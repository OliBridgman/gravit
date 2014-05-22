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

    GObject.inherit(IFLassoTool, IFMarqueeTool);

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
    GObject.inherit(IFLassoTool._AreaSelector, IFMarqueeTool._AreaSelector);

    /**
     * @type {GPoint}
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
    IFLassoTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M18.5,27c-3.7,0-4.7,2.9-5.5,5.2c-0.7,2-1.2,3.2-2.5,3.2c-0.8,0-1.5-0.3-2.1-0.8\n\tc-0.4-0.4-0.7-0.9-0.9-1.5c0.6-0.4,1-1,1-1.7c0-0.2,0-0.4-0.1-0.6c0.8-0.5,1.7-1.2,2.5-2c3.5-3.5,4.6-7.6,2.7-9.5\n\tc-0.6-0.6-1.5-0.9-2.4-0.9c-2.1,0-4.7,1.3-7,3.6c-3.5,3.5-4.6,7.6-2.7,9.5c0.6,0.6,1.5,0.9,2.4,0.9c0.3,0,0.6,0,0.9-0.1\n\tc0.3,0.6,1,1.1,1.8,1.1c0,0,0,0,0,0c0.3,0.7,0.6,1.4,1.2,1.9c0.7,0.7,1.7,1.1,2.8,1.1c2.2,0,2.8-2,3.5-4c0.8-2.3,1.6-4.6,4.5-4.6\n\tC18.5,28,18.5,27,18.5,27z M2.1,30.9c-0.9-0.9-0.6-2.4-0.4-3.2c0.5-1.6,1.5-3.4,3.1-4.9c2-2,4.5-3.3,6.3-3.3c0.7,0,1.3,0.2,1.7,0.6\n\tc0.4,0.4,0.6,1,0.6,1.7c0,1.9-1.3,4.3-3.3,6.3c-0.7,0.7-1.5,1.4-2.3,1.9c-0.4-0.3-0.8-0.5-1.4-0.5c-1.1,0-2,0.9-2,1.9\n\tc-0.2,0-0.4,0.1-0.7,0.1C3.1,31.5,2.5,31.3,2.1,30.9z"/>\n</svg>\n';
    };

    /** @override */
    IFLassoTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    IFLassoTool.prototype.getHint = function () {
        return IFTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(IFLassoTool, "title"));
    };

    /** @override */
    IFLassoTool.prototype.getCursor = function () {
        return GUICursor.Lasso;
    };

    /** override */
    IFLassoTool.prototype.toString = function () {
        return "[Object IFLassoTool]";
    };

    _.IFLassoTool = IFLassoTool;
})(this);