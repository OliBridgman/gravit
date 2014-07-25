(function (_) {

    /**
     * Action saving a document filed under a name
     * @param {GStorage} storage
     * @param {Boolean} isDefault whether this is the default storage or not
     * @class GSaveAsAction
     * @extends GAction
     * @constructor
     */
    function GSaveAsAction(storage, isDefault) {
        this._storage = storage;
        this._default = isDefault;
    };
    IFObject.inherit(GSaveAsAction, GAction);

    GSaveAsAction.ID = 'file.save-as';
    GSaveAsAction.TITLE = new IFLocale.Key(GSaveAsAction, "title");
    GSaveAsAction.TITLE_DEFAULT = new IFLocale.Key(GSaveAsAction, "title-default");

    /**
     * @override
     */
    GSaveAsAction.prototype.getId = function () {
        return GSaveAsAction.ID + '.' + this._storage.getProtocol();
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getTitle = function () {
        return this._default ?
            ifLocale.get(GSaveAsAction.TITLE_DEFAULT) :
            ifLocale.get(GSaveAsAction.TITLE).replace('%name%', ifLocale.get(this._storage.getName()));
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getCategory = function () {
        return this._default ? GApplication.CATEGORY_FILE : GApplication.CATEGORY_FILE_SAVEAS;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getGroup = function () {
        return this._default ? "file" : "file/saveas_storage";
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getShortcut = function () {
        return this._default ? [IFKey.Constant.SHIFT, IFKey.Constant.META, 'S'] : null;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.execute = function () {
        gApp.saveDocumentAs(this._storage);
    };

    /** @override */
    GSaveAsAction.prototype.toString = function () {
        return "[Object GSaveAsAction]";
    };

    _.GSaveAsAction = GSaveAsAction;
})(this);