(function (_) {
    /**
     * The elliptical select tool
     * @class GXEllipseSelectTool
     * @extends GXMarqueeTool
     * @constructor
     */
    function GXEllipseSelectTool() {
        GXMarqueeTool.call(this, new GXEllipseSelectTool._AreaSelector());
    };

    GObject.inherit(GXEllipseSelectTool, GXMarqueeTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GXEllipseSelectTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXEllipseSelectTool._AreaSelector
     * @extends GXMarqueeTool._AreaSelector
     * @private
     */
    GXEllipseSelectTool._AreaSelector = function () {
        GXMarqueeTool._AreaSelector.call(this);
    };
    GObject.inherit(GXEllipseSelectTool._AreaSelector, GXMarqueeTool._AreaSelector);

    /**
     * @type {GPoint}
     * @private
     */
    GXEllipseSelectTool._AreaSelector.prototype._start = null;

    /** @override */
    GXEllipseSelectTool._AreaSelector.prototype.start = function (pos) {
        this._start = pos;
    };

    /** @override */
    GXEllipseSelectTool._AreaSelector.prototype.move = function (pos) {
        var x0, x2, y0, y2;

        x0 = this._start.getX();
        x2 = pos.getX();
        y0 = this._start.getY();
        y2 = pos.getY();

        this._vertexContainer.clearVertices();
        gArcVertexGenerator.createEllipse(this._vertexContainer, x0 + (x2 - x0) / 2, y0 + (y2 - y0) / 2,
            (x2 - x0) / 2, (y2 - y0) / 2, 0, gMath.PI2, 2);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXEllipseSelectTool Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    GXEllipseSelectTool.prototype.getImageClass = function () {
        return 'g-tool-ellipseselect';
    };

    /** @override */
    GXEllipseSelectTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXEllipseSelectTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXEllipseSelectTool, "title"));
    };

    /** @override */
    GXEllipseSelectTool.prototype.getCursor = function () {
        return GUICursor.Cross;
    };

    /** override */
    GXEllipseSelectTool.prototype.toString = function () {
        return "[Object GXEllipseSelectTool]";
    };

    _.GXEllipseSelectTool = GXEllipseSelectTool;
})(this);