(function (_) {

    /**
     * Action importing a document
     * @param {GXImport} import_
     * @class EXImportAction
     * @extends GUIAction
     * @constructor
     */
    function EXImportAction(import_) {
        this._import = import_;
    };
    GObject.inherit(EXImportAction, GUIAction);

    EXImportAction.ID = 'file.import';
    EXImportAction.TITLE = new GLocale.Key(EXImportAction, "title");

    /**
     * @override
     */
    EXImportAction.prototype.getId = function () {
        return EXImportAction.ID + '.' + this._import.getExtensions().join('-');
    };

    /**
     * @override
     */
    EXImportAction.prototype.getTitle = function () {
        return gLocale.get(EXImportAction.TITLE).replace('%name%', gLocale.get(this._import.getName()));
    };

    /**
     * @override
     */
    EXImportAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE_IMPORT;
    };

    /**
     * @override
     */
    EXImportAction.prototype.execute = function () {
        // TODO : Handle progress dialog & failure

        gApp.openFile(function (file) {
            var name = file.name.substring(0, file.name.lastIndexOf('.'));
            var ext = file.name.substring(name.length + 1).trim().toLowerCase();
            var foundExt = false;
            for (var i = 0; i < this._import.getExtensions().length; ++i) {
                if (this._import.getExtensions()[i].toLowerCase() === ext) {
                    foundExt = true;
                    var scene = new GXScene();
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
    EXImportAction.prototype.toString = function () {
        return "[Object EXImportAction]";
    };

    _.EXImportAction = EXImportAction;
})(this);