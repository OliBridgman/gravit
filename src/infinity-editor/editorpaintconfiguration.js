(function (_) {
    /**
     * A paint configuration for editor painting
     * @class IFEditorPaintConfiguration
     * @constructor
     * @extends IFScenePaintConfiguration
     */
    function IFEditorPaintConfiguration() {
    }

    IFObject.inherit(IFEditorPaintConfiguration, IFScenePaintConfiguration);

    /**
     * Whether to render the grid or not if it is active
     * @type {Boolean}
     */
    IFEditorPaintConfiguration.prototype.gridVisible = true;

    /** @override */
    IFEditorPaintConfiguration.prototype.toString = function () {
        return "[Object IFEditorPaintConfiguration]";
    };

    _.IFEditorPaintConfiguration = IFEditorPaintConfiguration;
})(this);