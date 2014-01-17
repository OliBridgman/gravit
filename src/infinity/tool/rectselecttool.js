(function (_) {
    /**
     * The rectangular select tool
     * @class GXRectSelectTool
     * @extends GXMarqueeTool
     * @constructor
     */
    function GXRectSelectTool() {
        GXMarqueeTool.call(this, new GXRectSelectTool._AreaSelector());
    };

    GObject.inherit(GXRectSelectTool, GXMarqueeTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GXRectSelectTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXRectSelectTool._AreaSelector
     * @extends GXMarqueeTool._AreaSelector
     * @private
     */
    GXRectSelectTool._AreaSelector = function () {
        GXMarqueeTool._AreaSelector.call(this);
    };
    GObject.inherit(GXRectSelectTool._AreaSelector, GXMarqueeTool._AreaSelector);

    /**
     * @type {GPoint}
     * @private
     */
    GXRectSelectTool._AreaSelector.prototype._start = null;

    /** @override */
    GXRectSelectTool._AreaSelector.prototype.begin = function () {
        GXMarqueeTool._AreaSelector.prototype.begin.call(this);
        this._vertexContainer.resize(5);
    };

    /** @override */
    GXRectSelectTool._AreaSelector.prototype.start = function (pos) {
        this._start = pos;
    };

    /** @override */
    GXRectSelectTool._AreaSelector.prototype.move = function (pos) {
        var x0, x2, y0, y2;

        x0 = this._start.getX();
        x2 = pos.getX();
        y0 = this._start.getY();
        y2 = pos.getY();

        this._vertexContainer.modifyVertex(GXVertex.Command.Move, x0, y0, 0);
        this._vertexContainer.modifyVertex(GXVertex.Command.Line, x2, y0, 1);
        this._vertexContainer.modifyVertex(GXVertex.Command.Line, x2, y2, 2);
        this._vertexContainer.modifyVertex(GXVertex.Command.Line, x0, y2, 3);
        this._vertexContainer.modifyVertex(GXVertex.Command.Close, 0, 0, 4);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXRectSelectTool Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    GXRectSelectTool.prototype.getImageClass = function () {
        return 'g-tool-rectselect';
    };

    /** @override */
    GXRectSelectTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXRectSelectTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXRectSelectTool, "title"));
    };

    /** @override */
    GXRectSelectTool.prototype.getCursor = function () {
        return GUICursor.Cross;
    };

    /** override */
    GXRectSelectTool.prototype.toString = function () {
        return "[Object GXRectSelectTool]";
    };

    _.GXRectSelectTool = GXRectSelectTool;
})(this);