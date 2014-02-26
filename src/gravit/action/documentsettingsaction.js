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
     * @param {EXDocument} [document]
     * @override
     */
    GDocumentSettingsAction.prototype.isEnabled = function (document) {
        return !!document || !!gApp.getActiveDocument();
    };

    /**
     * @param {EXDocument} [document]
     * @override
     */
    GDocumentSettingsAction.prototype.execute = function (document) {
        var document = document || gApp.getActiveDocument();
        var editor = document.getEditor();

        $('<div></div>')
            .text('DOCUMENT_SETTINGS')
            .gDialog({
                // TODO : I18N
                title: 'Page Setup',
                buttons: [
                    {
                        title: GLocale.Constant.Ok,
                        click: function () {
                            // TODO
                            /*
                            if (editor) {
                                var targetValues = [];
                                for (var i = 0; i < pages.length; ++i) {
                                    targetValues.push(pages[i].getProperties(propertiesToStore));
                                }

                                // TODO : I18N
                                editor.commitTransaction(function () {
                                    // Assign property values to each page now
                                    for (var i = 0; i < pages.length; ++i) {
                                        pages[i].setProperties(propertiesToStore, targetValues[i]);
                                    }
                                }, 'Page Settings');
                            }
                            */

                            $(this).gDialog('close');
                        }
                    },
                    {
                        title: GLocale.Constant.Cancel,
                        click: function () {
                            $(this).gDialog('close');
                        }
                    }
                ]
            })
            .gDialog('open');
    };

    /** @override */
    GDocumentSettingsAction.prototype.toString = function () {
        return "[Object GDocumentSettingsAction]";
    };

    _.GDocumentSettingsAction = GDocumentSettingsAction;
})(this);