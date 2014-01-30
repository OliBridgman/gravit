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
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M8.5,36.5l3.5-4h5.5l-9-7V36.5z M5.5,33c-0.3-0.1-0.7-0.3-1-0.4L5,31.6c0.3,0.1,0.6,0.3,0.9,0.4\n\tL5.5,33z M3.6,32c-0.3-0.2-0.6-0.4-0.8-0.7l0.7-0.7C3.7,30.8,4,31,4.2,31.1L3.6,32z M2.1,30.5c-0.2-0.3-0.4-0.6-0.6-0.9l0.9-0.5\n\tc0.2,0.3,0.3,0.5,0.5,0.8L2.1,30.5z M1,28.7c-0.1-0.3-0.2-0.7-0.3-1l1-0.2c0.1,0.3,0.2,0.6,0.3,0.9L1,28.7z M16.3,27.8l-1-0.3\n\tc0.1-0.3,0.1-0.6,0.2-0.9l1,0.1C16.4,27.1,16.4,27.4,16.3,27.8z M0.5,26.6c0-0.2,0-0.4,0-0.6c0-0.2,0-0.3,0-0.5l1,0.1\n\tc0,0.1,0,0.3,0,0.4c0,0.2,0,0.3,0,0.5L0.5,26.6z M15.5,25.7c0-0.3-0.1-0.6-0.1-0.9l1-0.2c0.1,0.3,0.1,0.7,0.1,1.1L15.5,25.7z\n\t M1.7,24.7l-1-0.2c0.1-0.3,0.2-0.7,0.3-1l0.9,0.4C1.8,24.1,1.7,24.4,1.7,24.7z M15.1,23.9c-0.1-0.3-0.2-0.6-0.4-0.8l0.9-0.5\n\tc0.2,0.3,0.3,0.6,0.4,1L15.1,23.9z M2.3,22.9l-0.9-0.5c0.2-0.3,0.4-0.6,0.6-0.9l0.8,0.6C2.7,22.4,2.5,22.7,2.3,22.9z M14.2,22.3\n\tc-0.2-0.2-0.4-0.5-0.6-0.7l0.7-0.7c0.2,0.2,0.5,0.5,0.7,0.8L14.2,22.3z M3.5,21.5l-0.7-0.7c0.3-0.2,0.5-0.5,0.8-0.7l0.6,0.8\n\tC3.9,21.1,3.7,21.3,3.5,21.5z M12.9,21c-0.2-0.2-0.5-0.4-0.8-0.5l0.5-0.9c0.3,0.2,0.6,0.4,0.9,0.6L12.9,21z M5,20.4l-0.5-0.9\n\tc0.3-0.2,0.6-0.3,1-0.4L5.8,20C5.5,20.1,5.2,20.2,5,20.4z M11.3,20c-0.3-0.1-0.6-0.2-0.9-0.3l0.3-1c0.3,0.1,0.7,0.2,1,0.3L11.3,20z\n\t M6.7,19.7l-0.2-1c0.3-0.1,0.7-0.1,1-0.2l0.1,1C7.3,19.6,7,19.6,6.7,19.7z M9.5,19.6c-0.3,0-0.6-0.1-0.9-0.1l0-1\n\tc0.4,0,0.7,0,1.1,0.1L9.5,19.6z"/>\n</svg>\n';
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