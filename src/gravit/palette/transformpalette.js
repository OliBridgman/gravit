(function (_) {

    /**
     * Transform Palette
     * @class GTransformPalette
     * @extends GPalette
     * @constructor
     */
    function GTransformPalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GTransformPalette, GPalette);

    GTransformPalette.ID = "transform";
    GTransformPalette.TITLE = new IFLocale.Key(GTransformPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GTransformPalette.prototype._htmlElement = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GTransformPalette.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GTransformPalette.prototype._elements = null;

    /** @override */
    GTransformPalette.prototype.getId = function () {
        return GTransformPalette.ID;
    };

    /** @override */
    GTransformPalette.prototype.getTitle = function () {
        return GTransformPalette.TITLE;
    };

    /** @override */
    GTransformPalette.prototype.getGroup = function () {
        return "properties";
    };

    /** @override */
    GTransformPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GTransformPalette.prototype.init = function (htmlElement, menu, controls) {
        GPalette.prototype.init.call(this, htmlElement, menu, controls);

        this._htmlElement = htmlElement;

        this._htmlElement.text('TRANSFORM & ALIGN');
    };

    /** @override */
    GTransformPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var editor = this._document.getEditor();

            // Subscribe to the editor's events
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
    GTransformPalette.prototype._updateFromSelection = function () {
        // TODO
    };

    /** @override */
    GTransformPalette.prototype.toString = function () {
        return "[Object GTransformPalette]";
    };

    _.GTransformPalette = GTransformPalette;
})(this);