(function (_) {

    /**
     * Action saving a document filed under a name
     * @class GSaveAsAction
     * @extends GAction
     * @constructor
     */
    function GSaveAsAction() {
    };
    GObject.inherit(GSaveAsAction, GAction);

    GSaveAsAction.ID = 'file.save-as';
    GSaveAsAction.TITLE = new GLocale.Key(GSaveAsAction, "title");

    /**
     * @override
     */
    GSaveAsAction.prototype.getId = function () {
        return GSaveAsAction.ID;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getTitle = function () {
        return GSaveAsAction.TITLE;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getGroup = function () {
        return 'file';
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getShortcut = function () {
        return [GKey.Constant.SHIFT, GKey.Constant.META, 'S'];
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.isEnabled = function () {
        return !!this._getViableStorage() && !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.execute = function () {
        gApp.saveDocumentAs(this._getViableStorage(), gApp.getActiveDocument());
    };

    /**
     * @returns {GStorage}
     * @private
     */
    GSaveAsAction.prototype._getViableStorage = function () {
        for (var i = 0; i < gravit.storages.length; ++i) {
            var storage = gravit.storages[i];
            if (storage.isAvailable() && storage.isPrompting() && storage.isSaving()) {
                var extensions = storage.getExtensions();
                if (!extensions || extensions.isEmpty() || extensions.indexOf('gravit') >= 0) {
                    return storage;
                }
            }
        }
        return null;
    };

    /** @override */
    GSaveAsAction.prototype.toString = function () {
        return "[Object GSaveAsAction]";
    };

    _.GSaveAsAction = GSaveAsAction;
})(this);