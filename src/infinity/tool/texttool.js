(function (_) {
    /**
     * The text tool
     * @class IFTextTool
     * @extends GXShapeTool
     * @constructor
     */
    function IFTextTool() {
        GXShapeTool.call(this, true, true);
    }

    GObject.inherit(IFTextTool, GXShapeTool);

    /** @override */
    IFTextTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    IFTextTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg">\n<text style="stroke:none; fill: inherit; font-family: Arial; font-size: 18px; text-anchor: middle" x="9" y="15">T</text>\n</svg>\n';
    };

    /** @override */
    IFTextTool.prototype.getHint = function () {
        return GXShapeTool.prototype.getHint.call(this).setTitle(new GLocale.Key(IFTextTool, "title"));
    };

    /** @override */
    IFTextTool.prototype.getActivationCharacters = function () {
        return ['T'];
    };

    /** @override */
    IFTextTool.prototype.getCursor = function () {
        if (!this._shape) {
            return GUICursor.Text;
        } else {
            return GXShapeTool.prototype.getCursor.call(this);
        }
    };

    /** @override */
    IFTextTool.prototype._createShape = function () {
        return new GXRectangle();
    };

    /** @override */
    IFTextTool.prototype._updateShape = function (shape, area, line) {
        // Original shape is a rectangle with coordinates x,y: [-1, 1]. Transform it to fit into the area:
        shape.setProperty('trf',
            new GTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
    };

    /** @override */
    IFTextTool.prototype._insertShape = function (shape) {
        // Create our text out of our rectangle here
        var text = new GXText();
        text.setProperties(['fw', 'fh', 'trf'], [true, true, shape.getProperty('trf')]);

        // Call super
        GXShapeTool.prototype._insertShape.call(this, text);
    };

    /** @override */
    IFTextTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    IFTextTool.prototype._createShapeManually = function (event) {
        var text = new GXText();
        var transform = this._view.getViewTransform();
        var scenePoint = transform.mapPoint(event.client);

        text.setProperty('trf', new GTransform(1, 0, 0, 1, scenePoint.getX(), scenePoint.getY()));

        GXShapeTool.prototype._insertShape.call(this, text);
    };

    /** override */
    IFTextTool.prototype.toString = function () {
        return "[Object IFTextTool]";
    };

    _.IFTextTool = IFTextTool;
})(this);