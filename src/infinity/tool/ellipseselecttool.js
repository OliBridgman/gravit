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
    GXEllipseSelectTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M16.5,31.5h-4l-2,3l0-7L16.5,31.5z M9,32.6c-0.3,0-0.6,0-0.8-0.1l-0.2,1c0.3,0.1,0.6,0.1,1,0.1L9,32.6z M7.3,32.2\n\tC7,32.2,6.7,32,6.5,31.9l-0.4,0.9C6.4,33,6.7,33.1,7,33.2L7.3,32.2z M5.7,31.5c-0.2-0.2-0.5-0.3-0.7-0.5l-0.6,0.7\n\tc0.2,0.2,0.5,0.4,0.8,0.6L5.7,31.5z M4.5,30.3c-0.2-0.2-0.3-0.5-0.5-0.7L3.2,30c0.2,0.3,0.4,0.6,0.6,0.9L4.5,30.3z M16.4,28.2\n\tL15.5,28c-0.1,0.3-0.1,0.6-0.3,0.8l0.9,0.4C16.2,28.9,16.3,28.5,16.4,28.2z M3.7,28.7c-0.1-0.3-0.2-0.6-0.2-0.9L2.6,28\n\tc0,0.4,0.1,0.7,0.2,1L3.7,28.7z M16.5,26.1L16.5,26.1l-0.9,0.1c0,0.3,0,0.6,0,0.9l0.9,0.1C16.5,26.8,16.5,26.4,16.5,26.1z M3.6,26.1\n\tl-0.9-0.2c-0.1,0.3-0.1,0.7-0.1,1.1L3.5,27C3.5,26.7,3.5,26.4,3.6,26.1z M16.2,25c-0.1-0.3-0.2-0.7-0.4-1L15,24.5\n\tc0.1,0.3,0.3,0.5,0.3,0.8L16.2,25z M4.2,24.5L3.4,24c-0.2,0.3-0.3,0.6-0.5,0.9l0.9,0.4C3.9,25,4.1,24.8,4.2,24.5z M15.2,23.1\n\tc-0.2-0.3-0.4-0.5-0.7-0.8l-0.6,0.8c0.2,0.2,0.4,0.4,0.6,0.6L15.2,23.1z M5.3,23.2l-0.6-0.8c-0.2,0.2-0.5,0.5-0.7,0.7l0.7,0.7\n\tC4.9,23.6,5.1,23.4,5.3,23.2z M13.8,21.7c-0.3-0.2-0.6-0.4-0.9-0.5l-0.4,0.9c0.3,0.1,0.5,0.3,0.7,0.4L13.8,21.7z M6.7,22.2l-0.4-0.9\n\tc-0.3,0.1-0.6,0.3-0.8,0.5L6,22.6C6.2,22.5,6.5,22.3,6.7,22.2z M12,20.9c-0.3-0.1-0.6-0.2-0.9-0.2l-0.1,1c0.3,0.1,0.6,0.1,0.8,0.2\n\tL12,20.9z M8.3,21.6l-0.2-1c-0.3,0.1-0.6,0.2-0.9,0.3l0.3,1C7.8,21.8,8.1,21.7,8.3,21.6z M10.1,20.5c-0.3,0-0.6,0-1,0l0.1,1\n\tc0.3,0,0.6,0,0.9,0L10.1,20.5z"/>\n</svg>\n';
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