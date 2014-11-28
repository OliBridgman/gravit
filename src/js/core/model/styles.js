(function (_) {
    /**
     * A collection of styles
     * @class GStyles
     * @extends GNode
     * @mixes GNode.Container
     * @mixes GNode.Store
     * @mixes GEventTarget
     * @constructor
     */
    function GStyles(workspace) {
        GNode.call(this);
        this._setWorkspace(workspace);


        // Add default styles for shapes & text
        var defShapeStyle = new GStyle();
        defShapeStyle.setProperties(['name', '_sdf', 'ps', '_bpt', '_fpt'], ['Shape Default', 'shape', [GStylable.PropertySet.Style, GStylable.PropertySet.Effects, GStylable.PropertySet.Fill, GStylable.PropertySet.Border], GRGBColor.BLACK, GRGBColor.WHITE]);
        this.appendChild(defShapeStyle);

        var defTextStyle = new GStyle();
        defTextStyle.setProperties(['name', '_sdf', 'ps', '_fpt'], ['Text Default', 'text', [GStylable.PropertySet.Style, GStylable.PropertySet.Effects, GStylable.PropertySet.Fill, GStylable.PropertySet.Border, GStylable.PropertySet.Text, GStylable.PropertySet.Paragraph], GRGBColor.BLACK]);
        this.appendChild(defTextStyle);
    }

    GNode.inheritAndMix("styles", GStyles, GNode, [GNode.Container, GNode.Store, GEventTarget]);

    _.GStyles = GStyles;
})(this);