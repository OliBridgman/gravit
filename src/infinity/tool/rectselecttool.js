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
    GXRectSelectTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M17.5,32.5H12l-3.5,4v-11L17.5,32.5z M1.5,18.5h-1v1h1V18.5z M3.5,18.5h-1v1h1V18.5z M5.5,18.5h-1v1\n\th1V18.5z M7.5,18.5h-1v1h1V18.5z M9.5,18.5h-1v1h1V18.5z M11.5,18.5h-1v1h1V18.5z M13.5,18.5h-1v1h1V18.5z M15.5,18.5h-1v1h1V18.5z\n\t M15.5,20.5h-1v1h1V20.5z M15.5,22.5h-1v1h1V22.5z M15.5,24.5h-1v1h1V24.5z M15.5,26.5h-1v1h1V26.5z M1.5,20.5h-1v1h1V20.5z\n\t M1.5,22.5h-1v1h1V22.5z M1.5,24.5h-1v1h1V24.5z M1.5,26.5h-1v1h1V26.5z M1.5,28.5h-1v1h1V28.5z M1.5,30.5h-1v1h1V30.5z M3.5,30.5\n\th-1v1h1V30.5z M5.5,30.5h-1v1h1V30.5z"/>\n</svg>\n';
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