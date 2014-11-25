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

    GObject.inherit(GSwatchesPalette, GPalette);

    GSwatchesPalette.ID = "swatches";
    GSwatchesPalette.TITLE = new GLocale.Key(GSwatchesPalette, "title");

    /**
     * @type {GProject}
     * @private
     */
    GSwatchesPalette.prototype._project = null;

    /**
     * @type {JQuery}
     * @private
     */
    GSwatchesPalette.prototype._swatchPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GSwatchesPalette.prototype._swatchImportControl = null;

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

        gApp.addEventListener(GApplication.ProjectEvent, this._projectEvent, this);

        var self = this;

        var importInput = $('<input>')
            .attr('type', 'file')
            .attr('accept', '.ase')
            .css({
                'position': 'absolute',
                'left': '-10000px'
            })
            .on('change', function (evt) {
                var files = $(evt.target)[0].files;
                if (files && files.length) {
                    GIO.read('application/x-adobe-ase', files[0], function (result) {
                        if (result && result.colors) {
                            var swatches = gApp.getActiveProject().getSwatches();
                            for (var i = 0; i < result.colors.length; ++i) {
                                var swatch = result.colors[i];
                                var pattern = null;

                                if (swatch.model === 'RGB') {
                                    pattern = new GRGBColor([swatch.color[0] * 255, swatch.color[1] * 255, swatch.color[2] * 255]);
                                } else if (swatch.model === 'CMYK') {
                                    pattern = new GCMYKColor(swatch.color);
                                }

                                if (pattern) {
                                    var node = new GSwatch();
                                    node.setProperties(['name', 'pat'], [swatch.name, pattern]);
                                    swatches.appendChild(node);
                                }
                            }
                        }
                    });
                }
                $(evt.target).val('');
            })
            .appendTo(htmlElement);

        this._swatchPanel = $('<div></div>')
            .addClass('g-list swatches')
            .gSwatchPanel({
                allowNameEdit: true,
                // TODO : I18N
                placeholder: 'Drop Swatches here'
            })
            .on('swatchchange', function (evt, swatch) {
                gApp.getActiveProject().getSwatches().acceptChildren(function (node) {
                    node.removeFlag(GNode.Flag.Selected);
                });

                if (swatch) {
                    swatch.setFlag(GNode.Flag.Selected);
                }

                this._updateControls();
            }.bind(this))
            .appendTo(htmlElement);

        this._swatchImportControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Import swatches')
            .attr('data-action', 'import')
            .on('click', function () {
                importInput.focus().trigger('click');
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-folder-open-o'))
            .appendTo(controls);

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
    GSwatchesPalette.prototype._projectEvent = function (event) {
        if (event.type === GApplication.ProjectEvent.Type.Activated) {
            this._project = event.project;
            var swatches = this._project.getSwatches();
            this._swatchPanel.gSwatchPanel('swatches', swatches);
            this._swatchPanel.gSwatchPanel('value', swatches.querySingle('swatch:selected'));
            this._updateControls();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.ProjectEvent.Type.Deactivated) {
            this._project = null;
            this._swatchPanel.gSwatchPanel('swatches', null);
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