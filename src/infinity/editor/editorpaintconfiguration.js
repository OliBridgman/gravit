(function (_) {
    /**
     * A paint configuration for editor painting
     * @class GXEditorPaintConfiguration
     * @constructor
     * @extends GXScenePaintConfiguration
     */
    function GXEditorPaintConfiguration() {
    }

    GObject.inherit(GXEditorPaintConfiguration, GXScenePaintConfiguration);

    /** @override */
    GXEditorPaintConfiguration.prototype.toString = function () {
        return "[Object GXEditorPaintConfiguration]";
    };

    _.GXEditorPaintConfiguration = GXEditorPaintConfiguration;
})(this);