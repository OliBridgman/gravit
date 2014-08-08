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
     * @type {JQuery}
     * @private
     */
    GExportPalette.prototype._controls = null;

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
        this._controls = controls;

        $('<button></button>')
            .attr('data-action', 'add')
            // TODO : I18N
            .attr('title', 'Add Export')
            .on('click', function () {
                var exportVal = this._element.getProperty('export', true);

                if (!exportVal) {
                    exportVal = [];
                } else {
                    exportVal = exportVal.slice(); // clone!!
                }

                exportVal.push({
                    'sz': '1x',
                    'sf': '',
                    'ex': gravit.exporters[0].getExtensions()[0]
                });

                this._element.setProperty('export', exportVal, true);
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-plus'))
            .appendTo(controls);
    };

    /** @override */
    GExportPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            editor.removeEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._document = null;
            this._elements = null;

            this._updateExports();

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GExportPalette.prototype._afterPropertiesChange = function (evt) {
        if (evt.node === this._element && (evt.properties.indexOf('export') >= 0 || evt.properties.indexOf('name') >= 0)) {
            this._updateExports();
        }
    };

    /**
     * @private
     */
    GExportPalette.prototype._updateFromSelection = function () {
        this._element = null;

        var selection = this._document ? this._document.getEditor().getSelection() : null;

        if (selection && selection.length === 1) {
            this._element = selection[0];
        } else if (this._document) {
            // use active page as element if any
            this._element = this._document.getScene().getActivePage();
        }

        this._updateExports();
    };

    GExportPalette.prototype._updateExports = function () {
        this._htmlElement.empty();

        if (this._element) {
            var name = this._element.getProperty('name');

            // TODO : I18N
            var title = 'Export ' + this._element.getNodeNameTranslated();
            if (name && name.trim() !== '') {
                title += ' "' + name + '"';
            }
            title += ' as:';

            $('<div></div>')
                .addClass('title')
                .text(title)
                .appendTo(this._htmlElement);

            var exportTable = $('<div></div>')
                .addClass('export-table')
                .appendTo(this._htmlElement);

            var exportVal = this._element.getProperty('export', true);
            if (exportVal && exportVal.length > 0) {
                for (var i = 0; i < exportVal.length; ++i) {
                    var extSelect = $('<select></select>');

                    for (var k = 0; k < gravit.exporters.length; ++k) {
                        var exporter = gravit.exporters[k];
                        if (!exporter.isStandalone()) {
                            var extensions = exporter.getExtensions();
                            for (var n = 0; n < extensions.length; ++n) {
                                $('<option></option>')
                                    .text(extensions[n].toUpperCase())
                                    .val(extensions[n])
                                    .data('exporter', exporter)
                                    .appendTo(extSelect);
                            }
                        }
                    }

                    $('<div></div>')
                        .addClass('export-row')
                        .data('export-index', i)
                        .append($('<div></div>')
                            .addClass('export-cell')
                            .append($('<input>')
                                .css('width', '4em')
                                // TODO: I18N
                                .attr('placeholder', 'Size')
                                .val('1x'))
                            .append($('<input>')
                                .css('width', '4em')
                                // TODO: I18N
                                .attr('placeholder', 'Suffix')
                                .val(''))
                            .append(extSelect))
                        .append($('<div></div>')
                            .addClass('export-cell')
                            .append($('<button></button>')
                                .append($('<span></span>')
                                    .addClass('fa fa-ellipsis-h')))
                            .append($('<button></button>')
                                .append($('<span></span>')
                                    .addClass('fa fa-external-link-square')))
                            .append($('<button></button>')
                                .append($('<span></span>')
                                    .addClass('fa fa-trash-o'))))
                        .appendTo(exportTable);
                }

                $('<div></div>')
                    .addClass('controls')
                    .append($('<button></button>')
                        .append($('<span></span>')
                            .text('Export All')))
                    .append($('<button></button>')
                        .append($('<span></span>')
                            .text('Export All as...')))
                    .appendTo(this._htmlElement);
            }
        }

        this._controls.find('[data-action="add"]').prop('disabled', !this._element);
    };

    /** @override */
    GExportPalette.prototype.toString = function () {
        return "[Object GExportPalette]";
    };

    _.GExportPalette = GExportPalette;
})(this);