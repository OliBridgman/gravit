(function (_) {
    /**
     * The lasso select tool
     * @class GXLassoTool
     * @extends GXMarqueeTool
     * @constructor
     */
    function GXLassoTool() {
        GXMarqueeTool.call(this, new GXLassoTool._AreaSelector());
    };

    GObject.inherit(GXLassoTool, GXMarqueeTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GXLassoTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXLassoTool._AreaSelector
     * @extends GXMarqueeTool._AreaSelector
     * @private
     */
    GXLassoTool._AreaSelector = function () {
        GXMarqueeTool._AreaSelector.call(this);
    };
    GObject.inherit(GXLassoTool._AreaSelector, GXMarqueeTool._AreaSelector);

    /**
     * @type {GPoint}
     * @private
     */
    GXLassoTool._AreaSelector.prototype._current = null;

    /** @override */
    GXLassoTool._AreaSelector.prototype.start = function (pos) {
        this._current = null;
    };

    /** @override */
    GXLassoTool._AreaSelector.prototype.move = function (pos) {
        if (this._current == null || Math.abs(pos.getX() - this._current.getX()) >= 3 || Math.abs(pos.getY() - this._current.getY()) >= 3) {
            this._vertexContainer.addVertex(this._vertexContainer.getCount() == 0 ? GXVertex.Command.Move : GXVertex.Command.Line, pos.getX(), pos.getY());
            this._current = pos;
        }
    };

    /** @override */
    GXLassoTool.prototype.getImageClass = function () {
        return 'g-tool-lassoselect';
    };

    /** @override */
    GXLassoTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXLassoTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXLassoTool, "title"));
    };

    /** @override */
    GXLassoTool.prototype.getCursor = function () {
        return GUICursor.Lasso;
    };

    /** override */
    GXLassoTool.prototype.toString = function () {
        return "[Object GXLassoTool]";
    };

    _.GXLassoTool = GXLassoTool;
})(this);