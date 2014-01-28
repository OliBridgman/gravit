(function (_) {

    /**
     * Action for document / scene settings setup
     * @class GDocumentSettingsAction
     * @extends GUIAction
     * @constructor
     */
    function GDocumentSettingsAction() {
    };
    GObject.inherit(GDocumentSettingsAction, GUIAction);

    GDocumentSettingsAction.ID = 'file.scene-settings';
    GDocumentSettingsAction.TITLE = new GLocale.Key(GDocumentSettingsAction, "title");

    /**
     * @override
     */
    GDocumentSettingsAction.prototype.getId = function () {
        return GDocumentSettingsAction.ID;
    };

    /**
     * @override
     */
    GDocumentSettingsAction.prototype.getTitle = function () {
        return GDocumentSettingsAction.TITLE;
    };

    /**
     * @override
     */
    GDocumentSettingsAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GDocumentSettingsAction.prototype.getGroup = function () {
        return "document";
    };

    /**
     * @override
     */
    GDocumentSettingsAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GDocumentSettingsAction.prototype.execute = function () {
        $('<div></div>')
            .text('DOCUMENT_SETTINGS')
            .gDialog()
            .gDialog('open');
    };

    /** @override */
    GDocumentSettingsAction.prototype.toString = function () {
        return "[Object GDocumentSettingsAction]";
    };

    _.GDocumentSettingsAction = GDocumentSettingsAction;
})(this);