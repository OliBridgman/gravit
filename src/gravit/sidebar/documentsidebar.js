(function (_) {
    /**
     * The pages & layers sidebar
     * @class GDocumentSidebar
     * @extends GSidebar
     * @constructor
     */
    function GDocumentSidebar() {
        GSidebar.call(this);
    }

    IFObject.inherit(GDocumentSidebar, GSidebar);

    GDocumentSidebar.ID = "document";
    GDocumentSidebar.TITLE = new IFLocale.Key(GDocumentSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GDocumentSidebar.prototype._htmlElement = null;

    /**
     * @type {GDocument}
     * @private
     */
    GDocumentSidebar.prototype._document = null;

    /** @override */
    GDocumentSidebar.prototype.getId = function () {
        return GDocumentSidebar.ID;
    };

    /** @override */
    GDocumentSidebar.prototype.getTitle = function () {
        return GDocumentSidebar.TITLE;
    };

    /** @override */
    GDocumentSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-file-text-o"></span>';
    };

    /** @override */
    GDocumentSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);
        this._htmlElement = htmlElement;

        var _createInput = function (property) {
            var self = this;
            if (property === 'unit') {
                return $('<select></select>')
                    .attr('data-property', property)
                    //.css('width', '100%')
                    .gUnit()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'unitSnap') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', IFScene.UnitSnap.None)
                        // TODO : I18N
                        .text('None'))
                    .append($('<option></option>')
                        .attr('value', IFScene.UnitSnap.Full)
                        // TODO : I18N
                        .text('Full'))
                    .append($('<option></option>')
                        .attr('value', IFScene.UnitSnap.Half)
                        // TODO : I18N
                        .text('Half'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'gridSizeX' || property === 'gridSizeY') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 1) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'gridActive') {
                return $('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-property', property)
                    .on('change', function () {
                        self._assignProperty(property, $(this).is(':checked'));
                    });
            } else if (property === 'crDistSmall' || property === 'crDistBig') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 1) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'crConstraint') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var angle = IFLength.parseEquationValue($(this).val());
                        if (angle !== null) {
                            angle = ifMath.normalizeAngleRadians(ifMath.toRadians(angle));
                            self._assignProperty(property, angle);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'snapDist' || property === 'pickDist') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var value = parseInt($(this).val());
                        if (!isNaN(value)) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'clspace') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', IFColorSpace.RGB)
                        .text('RGB'))
                    .append($('<option></option>')
                        .attr('value', IFColorSpace.CMYK)
                        .text('CMYK'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'pathImage' || property === 'pathFont' || property === 'pathExport') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '100%')
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Unit/Snap:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('unit'))
                    .append(_createInput('unitSnap'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Grid:'))
                .append($('<td></td>')
                    .append(_createInput('gridSizeX')
                        // TODO : I18N
                        .attr('title', 'Horizontal Grid-Size'))
                    .append(_createInput('gridSizeY')
                        // TODO : I18N
                        .attr('title', 'Vertical Grid-Size')))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .css('text-align', 'right')
                    .append(_createInput('gridActive'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Defaults'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Cursor:'))
                .append($('<td></td>')
                    .append(_createInput('crDistSmall')
                        // TODO : I18N
                        .attr('title', 'Small Distance when moving via Arrow-Keys'))
                    .append(_createInput('crDistBig')
                        // TODO : I18N
                        .attr('title', 'Large Distance when moving via Arrow-Keys')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('°'))
                .append($('<td></td>')
                    .append(_createInput('crConstraint')
                        // TODO : I18N
                        .attr('title', 'Constraints when moving via Shift in Degrees'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .html('<span class="fa fa-arrows"></span> / <span class="fa fa-magnet"></span>'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pickDist')
                        // TODO : I18N
                        .attr('title', 'Pick Distance in Pixels'))
                    .append(_createInput('snapDist')
                        // TODO : I18N
                        .attr('title', 'Snap Distance'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Color'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Color:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('clspace')
                        // TODO : I18N
                        .attr('title', 'Default Colorspace of document'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Pathes'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Images'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathImage')
                        // TODO : I18N
                        .attr('title', 'Path for imported image assets'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Fonts'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathFont')
                        // TODO : I18N
                        .attr('title', 'Path for imported font assets'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Export'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathExport')
                        // TODO : I18N
                        .attr('title', 'Path for exported assets'))))
            .appendTo(htmlElement);
    };

    /** @override */
    GDocumentSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GDocumentSidebar.prototype._afterPropertiesChange = function (event) {
        if (event.node === this._document.getScene()) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GDocumentSidebar.prototype._updateProperties = function () {
        var scene = this._document.getScene();
        this._htmlElement.find('select[data-property="unit"]').val(scene.getProperty('unit'));
        this._htmlElement.find('select[data-property="unitSnap"]').val(scene.getProperty('unitSnap'));
        this._htmlElement.find('input[data-property="gridSizeX"]').val(scene.pointToString(scene.getProperty('gridSizeX')));
        this._htmlElement.find('input[data-property="gridSizeY"]').val(scene.pointToString(scene.getProperty('gridSizeY')));
        this._htmlElement.find('input[data-property="gridActive"]').prop('checked', scene.getProperty('gridActive'));
        this._htmlElement.find('input[data-property="crDistSmall"]').val(scene.pointToString(scene.getProperty('crDistSmall')));
        this._htmlElement.find('input[data-property="crDistBig"]').val(scene.pointToString(scene.getProperty('crDistBig')));
        this._htmlElement.find('input[data-property="crConstraint"]').val(
            ifUtil.formatNumber(ifMath.toDegrees(scene.getProperty('crConstraint')), 2));
        this._htmlElement.find('input[data-property="snapDist"]').val(scene.pointToString(scene.getProperty('snapDist')));
        this._htmlElement.find('input[data-property="pickDist"]').val(scene.pointToString(scene.getProperty('pickDist')));
        this._htmlElement.find('select[data-property="clspace"]').val(scene.getProperty('clspace'));
        this._htmlElement.find('input[data-property="pathImage"]').val(scene.getProperty('pathImage'));
        this._htmlElement.find('input[data-property="pathFont"]').val(scene.getProperty('pathFont'));
        this._htmlElement.find('input[data-property="pathExport"]').val(scene.getProperty('pathExport'));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GDocumentSidebar.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GDocumentSidebar.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            this._document.getScene().setProperties(properties, values);
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Document Properties');
        }
    };

    /** @override */
    GDocumentSidebar.prototype.toString = function () {
        return "[Object GDocumentSidebar]";
    };

    _.GDocumentSidebar = GDocumentSidebar;
})(this);