(function (_) {

    /**
     * Document properties panel
     * @class GDocumentProperties
     * @extends EXProperties
     * @constructor
     */
    function GDocumentProperties() {
    };
    GObject.inherit(GDocumentProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GDocumentProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GDocumentProperties.prototype._document = null;

    /** @override */
    GDocumentProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Document';
    };

    /** @override */
    GDocumentProperties.prototype.init = function (panel, menu) {
        this._panel = panel;

        $('<button></button>')
            // TODO : I18N
            .text('Document Settings')
            .on('click', function () {
                gApp.executeAction(GDocumentSettingsAction.ID);
            })
            .appendTo(panel);

        $('<button></button>')
            // TODO : I18N
            .text('Page Setup')
            .on('click', function () {
                gApp.executeAction(GPageSetupAction.ID);
            })
            .appendTo(panel);
    };

    /** @override */
    GDocumentProperties.prototype.updateFromNodes = function (document, nodes) {
        if (this._document) {
            this._document = null;
        }

        if (nodes.length === 1 && nodes[0] instanceof GXScene) {
            this._document = document;
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @private
     */
    GDocumentProperties.prototype._updateProperties = function () {
        // NO-OP
    };

    /** @override */
    GDocumentProperties.prototype.toString = function () {
        return "[Object GDocumentProperties]";
    };

    _.GDocumentProperties = GDocumentProperties;
})(this);