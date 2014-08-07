(function (_) {

    /**
     * Export Palette
     * @class GExportPalette
     * @extends GPalette
     * @constructor
     */
    function GExportPalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GExportPalette, GPalette);

    GExportPalette.ID = "export";
    GExportPalette.TITLE = new IFLocale.Key(GExportPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GExportPalette.prototype._htmlElement = null;

    /**
     * @type {GDocument}
     * @private
     */
    GExportPalette.prototype._document = null;

    /**
     * @type {IFElement}
     * @private
     */
    GExportPalette.prototype._element = null;

    /** @override */
    GExportPalette.prototype.getId = function () {
        return GExportPalette.ID;
    };

    /** @override */
    GExportPalette.prototype.getTitle = function () {
        return GExportPalette.TITLE;
    };

    /** @override */
    GExportPalette.prototype.getGroup = function () {
        return "properties";
    };

    /** @override */
    GExportPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GExportPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;

        $('<div>EXPORT</div>')
            .appendTo(this._htmlElement);
    };

    /** @override */
    GExportPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var editor = this._document.getEditor();

            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var editor = this._document.getEditor();

            // Unsubscribe from the editor's events
            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._document = null;
            this._elements = null;

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @private
     */
    GExportPalette.prototype._updateFromSelection = function () {
        this._elements = null;

        // TODO
        /*
        var selection = this._document.getEditor().getSelection();
        
        // Filter elements by transformables
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i].hasMixin(IFElement.Transform)) {
                    if (!this._elements) {
                        this._elements = [];
                    }
                    this._elements.push(selection[i]);
                }
            }
        }
*/
    };

    /** @override */
    GExportPalette.prototype.toString = function () {
        return "[Object GExportPalette]";
    };

    _.GExportPalette = GExportPalette;
})(this);