(function (_) {

    /**
     * Action saving a document filed under a name
     * @param {IFStorage} storage
     * @param {Boolean} isDefault whether this is the default storage or not
     * @class GSaveAsAction
     * @extends GUIAction
     * @constructor
     */
    function GSaveAsAction(storage, isDefault) {
        this._storage = storage;
        this._default = isDefault;
    };
    IFObject.inherit(GSaveAsAction, GUIAction);

    GSaveAsAction.ID = 'file.save-as';
    GSaveAsAction.TITLE = new IFLocale.Key(GSaveAsAction, "title");

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
        return ifLocale.get(GSaveAsAction.TITLE).replace('%name%', ifLocale.get(this._storage.getName()));
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE_SAVEAS;
    };

    /**
     * @override
     */
    GSaveAsAction.prototype.getGroup = function () {
        return "file/saveas_storage";
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
        var document = gApp.getActiveDocument();

        // TODO : Set first parameter 'reference'
        this._storage.saveBlobPrompt(null, document.getTitle(), 'gravit', function (blob) {
            document.setBlob(blob);
            document.save();
        });
    };

    /** @override */
    GSaveAsAction.prototype.toString = function () {
        return "[Object GSaveAsAction]";
    };

    _.GSaveAsAction = GSaveAsAction;
})(this);