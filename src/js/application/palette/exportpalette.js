(function (_) {

    /**
     * Export Palette
     * @class GExportPalette
     * @extends GPalette
     * @constructor
     */
    function GExportPalette() {
        GPalette.call(this);
        this._extensions = [];
    }

    GObject.inherit(GExportPalette, GPalette);

    GExportPalette.ID = "export";
    GExportPalette.TITLE = new GLocale.Key(GExportPalette, "title");

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
     * @type {GElement}
     * @private
     */
    GExportPalette.prototype._element = null;

    /**
     * @type {Array<{{extension: String, exporter: GExporter}}>}
     * @private
     */
    GExportPalette.prototype._extensions = null;

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
        return "modify";
    };

    /** @override */
    GExportPalette.prototype.isEnabled = function () {
        return this._document !== null && this._element !== null;
    };

    /** @override */
    GExportPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);

        // Init our extensions / exporters
        for (var k = 0; k < gravit.exporters.length; ++k) {
            var exporter = gravit.exporters[k];
            if (!exporter.isStandalone()) {
                var extensions = exporter.getExtensions();
                for (var n = 0; n < extensions.length; ++n) {
                    this._extensions.push({
                        extension: extensions[n].toLowerCase(),
                        exporter: exporter
                    });
                }
            }
        }

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

        $('<div></div>')
            .addClass('title')
            .appendTo(this._htmlElement);

        $('<div></div>')
            .addClass('g-list export-table')
            .appendTo(this._htmlElement);

        $('<div></div>')
            .addClass('controls')
            .attr('data-action', 'export-all')
            .append($('<button></button>')
                .on('click', function () {
                    var storage = gApp.getMatchingStorage(true, true, null, true, this._document.getStorage());
                    if (storage) {
                        storage.openDirectoryPrompt(this._document.getUrl(), function (url) {
                            var exports = this._element.getProperty('export', true);
                            for (var i = 0; i < exports.length; ++i) {
                                var exportRow = exports[i];
                                var resourceUrl = new URI(url).filename(this._element.getLabel() + exportRow.sf + '.' + exportRow.ex).toString();
                                this._getExporterByExt(exportRow.ex).exportPart(this._element, exportRow.sz, storage, resourceUrl, exportRow.ex);
                            }
                        }.bind(this));
                    }
                }.bind(this))
                .append($('<span></span>')
                    .text('Export All...')))
            .appendTo(this._htmlElement);
    };

    GExportPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            scene.addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            editor.addEventListener(GEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._updateFromSelection();
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            scene.removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            editor.removeEventListener(GEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._document = null;
            this._element = null;

            this._updateExports();

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @param {GNode.AfterPropertiesChangeEvent} event
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
            // use scene as element
            this._element = this._document.getScene();
        }

        this._updateExports();
        this.trigger(GPalette.UPDATE_EVENT);
    };

    GExportPalette.prototype._updateExports = function () {
        var exportTable = this._htmlElement.find('.export-table');
        var exportTitle = this._htmlElement.find('.title');
        exportTable.empty();
        exportTitle.text('');

        this._htmlElement.find('[data-action="export-all"]').prop('disabled', !this._element);

        if (this._element) {
            var name = this._element.getProperty('name');

            // TODO : I18N
            var title = 'Export ' + this._element.getNodeNameTranslated();
            if (name && name.trim() !== '') {
                title += ' "' + name + '"';
            }
            title += ' as:';

            exportTitle.text(title);

            var _addExportRow = function (exportRow, index) {
                var extSelect = $('<select></select>');

                for (var i = 0; i < this._extensions.length; ++i) {
                    var ext = this._extensions[i];
                    $('<option></option>')
                        .text(ext.extension.toUpperCase())
                        .val(ext.extension)
                        .appendTo(extSelect);
                }

                $('<div></div>')
                    .addClass('export-row')
                    .data('export-index', i)
                    .append($('<div></div>')
                        .addClass('export-cell')
                        .append($('<input>')
                            .css('width', '86px')
                            // TODO: I18N
                            .attr('placeholder', 'Size')
                            .val(exportRow.sz)
                            .on('change', function (evt) {
                                exportRow.sz = $(evt.target).val();
                            }))
                        .append($('<input>')
                            .css('width', '58px')
                            // TODO: I18N
                            .attr('placeholder', 'Suffix')
                            .val(exportRow.sf)
                            .on('change', function (evt) {
                                exportRow.sf = $(evt.target).val();
                            }))
                        .append(extSelect
                            .val(exportRow.ex)
                            .on('change', function (evt) {
                                exportRow.ex = $(evt.target).val();
                            })))
                    .append($('<div></div>')
                        .addClass('export-cell')
                        .append($('<button></button>')
                            // TODO : I18N
                            .attr('title', 'Export this item only')
                            .on('click', function () {
                                var storage = gApp.getMatchingStorage(true, true, exportRow.ex, false, this._document.getStorage());
                                if (storage) {
                                    storage.saveResourcePrompt(this._document.getUrl(), this._element.getLabel() + exportRow.sf, [exportRow.ex], function (url) {
                                        this._getExporterByExt(exportRow.ex).exportPart(this._element, exportRow.sz, storage, url, exportRow.ex);
                                    }.bind(this));
                                }
                            }.bind(this))
                            .append($('<span></span>')
                                .addClass('fa fa-external-link-square')))
                        .append($('<button></button>')
                            .append($('<span></span>')
                                .addClass('fa fa-trash-o'))
                            .on('click', function () {
                                var exports = this._element.getProperty('export', true).slice();
                                exports.splice(index, 1);
                                this._element.setProperty('export', exports, true);
                            }.bind(this))))
                    .appendTo(exportTable);
            }.bind(this);

            var exports = this._element.getProperty('export', true);
            if (exports && exports.length > 0) {
                for (var i = 0; i < exports.length; ++i) {
                    _addExportRow(exports[i], i);
                }
            }
        }

        this._controls.find('[data-action="add"]').prop('disabled', !this._element);
    };

    /**
     * @param {String} extension
     * @returns {GExporter}
     * @private
     */
    GExportPalette.prototype._getExporterByExt = function (extension) {
        extension = extension.toLowerCase();
        for (var i = 0; i < this._extensions.length; ++i) {
            if (this._extensions[i].extension === extension) {
                return this._extensions[i].exporter;
            }
        }
        return null;
    };

    /** @override */
    GExportPalette.prototype.toString = function () {
        return "[Object GExportPalette]";
    };

    _.GExportPalette = GExportPalette;
})(this);