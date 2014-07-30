(function (_) {

    /**
     * Action importing a document
     * @param {GImporter} importer
     * @class GImportAction
     * @extends GAction
     * @constructor
     */
    function GImportAction(importer) {
        this._importer = importer;
    };
    IFObject.inherit(GImportAction, GAction);

    GImportAction.ID = 'file.import';
    GImportAction.TITLE = new IFLocale.Key(GImportAction, "title");

    /**
     * @override
     */
    GImportAction.prototype.getId = function () {
        return GImportAction.ID + '.' + this._importer.getExtensions().join('-');
    };

    /**
     * @override
     */
    GImportAction.prototype.getTitle = function () {
        return ifLocale.get(GImportAction.TITLE).replace('%name%', ifLocale.get(this._importer.getName()));
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
    GImportAction.prototype.getGroup = function () {
        var result = 'import';
        var group = this._importer.getGroup();
        if (group) {
            result += '/' + group;
        } else {
            result += '/*';
        }
        return result;
    };

    /**
     * @override
     */
    GImportAction.prototype.isEnabled = function () {
        return this._importer.isAvailable();
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
            for (var i = 0; i < this._importer.getExtensions().length; ++i) {
                if (this._importer.getExtensions()[i].toLowerCase() === ext) {
                    foundExt = true;
                    var scene = new IFScene();
                    this._importer.import(file, scene, function (result) {
                        if (result) {
                            gApp.addDocument(scene, name);
                        }
                    }.bind(this));
                }
            }

            if (!foundExt) {
                // TODO : I18N
                alert('Invalid file extension, expected one of: ' + this._importer.getExtensions().join(','));
            }
        }.bind(this), false);
    };

    /** @override */
    GImportAction.prototype.toString = function () {
        return "[Object GImportAction]";
    };

    _.GImportAction = GImportAction;
})(this);