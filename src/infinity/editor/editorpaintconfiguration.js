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

    /** @override */
    IFEditorPaintConfiguration.prototype.toString = function () {
        return "[Object IFEditorPaintConfiguration]";
    };

    _.IFEditorPaintConfiguration = IFEditorPaintConfiguration;
})(this);