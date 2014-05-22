(function (_) {

    /**
     * Action opening a document on a specific storage
     * @param {IFStorage} storage
     * @param {Boolean} isDefault whether this is the default storage or not
     * @class GOpenAction
     * @extends GUIAction
     * @constructor
     */
    function GOpenAction(storage, isDefault) {
        this._storage = storage;
        this._default = isDefault;
    };
    IFObject.inherit(GOpenAction, GUIAction);

    GOpenAction.ID = 'file.open';
    GOpenAction.TITLE = new IFLocale.Key(GOpenAction, "title");
    GOpenAction.TITLE_DEFAULT = new IFLocale.Key(GOpenAction, "title-default");

    /**
     * @override
     */
    GOpenAction.prototype.getId = function () {
        return GOpenAction.ID + '.' + this._storage.getProtocol();
    };

    /**
     * @override
     */
    GOpenAction.prototype.getTitle = function () {
        return this._default ?
            ifLocale.get(GOpenAction.TITLE_DEFAULT) :
        ifLocale.get(GOpenAction.TITLE).replace('%name%', ifLocale.get(this._storage.getName()));
    };

    /**
     * @override
     */
    GOpenAction.prototype.getCategory = function () {
        return this._default ? GApplication.CATEGORY_FILE : GApplication.CATEGORY_FILE_OPEN;
    };

    /**
     * @override
     */
    GOpenAction.prototype.getGroup = function () {
        return this._default ? "file" : "file/open_storage";
    };

    /**
     * @override
     */
    GOpenAction.prototype.getShortcut = function () {
        return this._default ? [IFKey.Constant.META, 'O'] : null;
    };

    /**
     * @override
     */
    GOpenAction.prototype.execute = function () {
        // TODO : Set first parameter 'reference'
        this._storage.openBlobPrompt(null, ['gravit'], function (blob) {
            gApp.addDocument(blob);
        });
    };

    /** @override */
    GOpenAction.prototype.toString = function () {
        return "[Object GOpenAction]";
    };

    _.GOpenAction = GOpenAction;
})(this);