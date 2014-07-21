(function (_) {

    /**
     * Action importing a document
     * @param {GImport} import_
     * @class GImportAction
     * @extends GAction
     * @constructor
     */
    function GImportAction(import_) {
        this._import = import_;
    };
    IFObject.inherit(GImportAction, GAction);

    GImportAction.ID = 'file.import';
    GImportAction.TITLE = new IFLocale.Key(GImportAction, "title");

    /**
     * @override
     */
    GImportAction.prototype.getId = function () {
        return GImportAction.ID + '.' + this._import.getExtensions().join('-');
    };

    /**
     * @override
     */
    GImportAction.prototype.getTitle = function () {
        return ifLocale.get(GImportAction.TITLE).replace('%name%', ifLocale.get(this._import.getName()));
    };

    /**
     * @override
     */
    GImportAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE_IMPORT;
    };

    /**
     * @override
     */
    GImportAction.prototype.execute = function () {
        // TODO : Handle progress dialog & failure

        gApp.openFile(function (file) {
            var name = file.name.substring(0, file.name.lastIndexOf('.'));
            var ext = file.name.substring(name.length + 1).trim().toLowerCase();
            var foundExt = false;
            for (var i = 0; i < this._import.getExtensions().length; ++i) {
                if (this._import.getExtensions()[i].toLowerCase() === ext) {
                    foundExt = true;
                    var scene = new IFScene();
                    this._import.import(file, scene, function (result) {
                        if (result) {
                            gApp.addDocument(scene, name);
                        }
                    }.bind(this));
                }
            }

            if (!foundExt) {
                // TODO : I18N
                alert('Invalid file extension, expected one of: ' + this._import.getExtensions().join(','));
            }
        }.bind(this), false);
    };

    /** @override */
    GImportAction.prototype.toString = function () {
        return "[Object GImportAction]";
    };

    _.GImportAction = GImportAction;
})(this);