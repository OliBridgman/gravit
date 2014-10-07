(function (_) {

    /**
     * Swatches Palette
     * @class GSwatchesPalette
     * @extends GPalette
     * @constructor
     */
    function GSwatchesPalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GSwatchesPalette, GPalette);

    GSwatchesPalette.ID = "swatches";
    GSwatchesPalette.TITLE = new IFLocale.Key(GSwatchesPalette, "title");

    /**
     * @type {GDocument}
     * @private
     */
    GSwatchesPalette.prototype._document = null;

    /**
     * @type {JQuery}
     * @private
     */
    GSwatchesPalette.prototype._swatchPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GSwatchesPalette.prototype._swatchDeleteControl = null;

    /** @override */
    GSwatchesPalette.prototype.getId = function () {
        return GSwatchesPalette.ID;
    };

    /** @override */
    GSwatchesPalette.prototype.getTitle = function () {
        return GSwatchesPalette.TITLE;
    };

    /** @override */
    GSwatchesPalette.prototype.getGroup = function () {
        return "assets";
    };

    /** @override */
    GSwatchesPalette.prototype.isEnabled = function () {
        return this._document !== null;
    };

    /** @override */
    GSwatchesPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._swatchPanel = $('<div></div>')
            .addClass('g-list swatches g-swatch-list')
            .gSwatchPanel({
                allowNameEdit: true,
                // TODO : I18N
                placeholder: 'Drop Swatches here'
            })
            .on('swatchchange', function (evt, swatch) {
                this._document.getScene().getSwatchCollection().acceptChildren(function (node) {
                    node.removeFlag(IFNode.Flag.Selected);
                });

                if (swatch) {
                    swatch.setFlag(IFNode.Flag.Selected);
                }

                this._updateControls();
            }.bind(this))
            .appendTo(htmlElement);

        this._swatchDeleteControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Delete Selected Swatch')
            .attr('data-action', 'delete')
            .on('click', function () {
                var swatch = this._swatchPanel.gSwatchPanel('value');
                var editor = this._document.getEditor();
                editor.beginTransaction();
                try {
                    swatch.getParent().removeChild(swatch);
                } finally {
                    editor.commitTransaction('Delete Swatch');
                }
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-trash-o'))
            .appendTo(controls);

        this._updateControls();
    };

    /** @override */
    GSwatchesPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            this._swatchPanel.gSwatchPanel('attach', scene.getSwatchCollection());
            this._swatchPanel.gSwatchPanel('value', scene.getSwatchCollection().querySingle('swatch:selected'));
            this._updateControls();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._document = null;
            this._swatchPanel.gSwatchPanel('detach');
            this._updateControls();
            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /** @private */
    GSwatchesPalette.prototype._updateControls = function () {
        var swatch = this._swatchPanel.gSwatchPanel('value');
        this._swatchDeleteControl.prop('disabled', !swatch);
    };

    /** @override */
    GSwatchesPalette.prototype.toString = function () {
        return "[Object GSwatchesPalette]";
    };

    _.GSwatchesPalette = GSwatchesPalette;
})(this);