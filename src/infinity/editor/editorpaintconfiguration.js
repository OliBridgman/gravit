(function (_) {
    /**
     * A paint configuration for editor painting
     * @class GXEditorPaintConfiguration
     * @constructor
     * @extends GXPaintConfiguration
     */
    function GXEditorPaintConfiguration() {
    }

    GObject.inherit(GXEditorPaintConfiguration, GXPaintConfiguration);

    /** @override */
    GXEditorPaintConfiguration.prototype.toString = function () {
        return "[Object GXEditorPaintConfiguration]";
    };

    _.GXEditorPaintConfiguration = GXEditorPaintConfiguration;
})(this);