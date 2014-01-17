(function (_) {

    /**
     * Action importing a document
     * @param {GXExport} export_
     * @class EXExportAction
     * @extends GUIAction
     * @constructor
     */
    function EXExportAction(export_) {
        this._export = export_;
    };
    GObject.inherit(EXExportAction, GUIAction);

    EXExportAction.ID = 'file.export';
    EXExportAction.TITLE = new GLocale.Key(EXExportAction, "title");

    /**
     * @override
     */
    EXExportAction.prototype.getId = function () {
        return EXExportAction.ID + '.' + this._export.getExtension();
    };

    /**
     * @override
     */
    EXExportAction.prototype.getTitle = function () {
        return gLocale.get(EXExportAction.TITLE).replace('%name%', gLocale.get(this._export.getName()));
    };

    /**
     * @override
     */
    EXExportAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE_EXPORT;
    };

    /**
     * @override
     */
    EXExportAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    EXExportAction.prototype.execute = function () {
        // TODO : Handle progress dialog

        var document = gApp.getActiveDocument();

        this._export.export(document.getScene(), function (blob) {
            if (blob) {
                saveAs(blob, document.getTitle() + '.' + this._export.getExtension());
            }
        }.bind(this));
    };

    /** @override */
    EXExportAction.prototype.toString = function () {
        return "[Object EXExportAction]";
    };

    _.EXExportAction = EXExportAction;
})(this);