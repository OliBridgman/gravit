(function (_) {

    /**
     * Action opening a document via the system storage
     * @class GOpenAction
     * @extends GAction
     * @constructor
     */
    function GOpenAction() {
    };
    GObject.inherit(GOpenAction, GAction);

    GOpenAction.ID = 'file.open';
    GOpenAction.TITLE = new GLocale.Key(GOpenAction, "title");

    /**
     * @override
     */
    GOpenAction.prototype.getId = function () {
        return GOpenAction.ID;
    };

    /**
     * @override
     */
    GOpenAction.prototype.getTitle = function () {
        return GOpenAction.TITLE;
    };

    /**
     * @override
     */
    GOpenAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GOpenAction.prototype.getGroup = function () {
        return 'file';
    };

    /**
     * @override
     */
    GOpenAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, 'O'];
    };

    /**
     * @override
     */
    GOpenAction.prototype.isEnabled = function () {
        return !!this._getViableStorage();
    };

    /**
     * @override
     */
    GOpenAction.prototype.execute = function () {
        gApp.openDocumentFrom(this._getViableStorage());
    };

    /**
     * @returns {GStorage}
     * @private
     */
    GOpenAction.prototype._getViableStorage = function () {
        for (var i = 0; i < gravit.storages.length; ++i) {
            var storage = gravit.storages[i];
            if (storage.isAvailable() && storage.isPrompting()) {
                var extensions = storage.getExtensions();
                if (!extensions || extensions.isEmpty() || extensions.indexOf('gravit') >= 0) {
                    return storage;
                }
            }
        }
        return null;
    };

    /** @override */
    GOpenAction.prototype.toString = function () {
        return "[Object GOpenAction]";
    };

    _.GOpenAction = GOpenAction;
})(this);