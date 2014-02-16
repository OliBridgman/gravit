(function (_) {

    /**
     * Page properties panel
     * @class GPageProperties
     * @extends EXProperties
     * @constructor
     */
    function GPageProperties() {
        this._pages = [];
    };
    GObject.inherit(GPageProperties, EXProperties);

    GPageProperties.options = {
        sizePresets: [
            {
                // TODO : I18N
                name: 'Paper',
                sizes: [
                    {
                        name: 'A0',
                        width: '841mm',
                        height: '1189mm'
                    },
                    {
                        name: 'A1',
                        width: '594mm',
                        height: '841mm'
                    },
                    {
                        name: 'A2',
                        width: '420mm',
                        height: '594mm'
                    },
                    {
                        name: 'A3',
                        width: '297mm',
                        height: '420mm'
                    },
                    {
                        name: 'A4',
                        width: '210mm',
                        height: '297mm'
                    },
                    {
                        name: 'A5',
                        width: '148,5mm',
                        height: '210mm'
                    }
                ]
            },
            {
                // TODO : I18N
                name: 'Phone',
                sizes: [
                    {
                        name: 'Apple iPhone 4 (S)',
                        width: '640px',
                        height: '960px'
                    },
                    {
                        name: 'Apple iPhone 5',
                        width: '640px',
                        height: '1136px'
                    }
                ]
            },
            {
                // TODO : I18N
                name: 'Tablet',
                sizes: [
                    {
                        name: 'Apple iPad 1 & 2 & Mini',
                        width: '768px',
                        height: '1024px'
                    },
                    {
                        name: 'Apple iPad 3 & 4',
                        width: '1536px',
                        height: '2048px'
                    }
                ]
            }
        ]
    };
    
    /**
     * @type {JQuery}
     * @private
     */
    GPageProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GPageProperties.prototype._document = null;

    /**
     * @type {Array<GXPolygon>}
     * @private
     */
    GPageProperties.prototype._pages = null;

    /** @override */
    GPageProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Page';
    };

    /** @override */
    GPageProperties.prototype.init = function (panel, menu) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'title') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', 'title')
                    .css('width', '100%')
                    .gAutoBlur()
                    .on('change', function () {
                        /*
                        var points = parseInt($(this).val());
                        if (!isNaN(points)) {
                            var innerAngle = gMath.normalizeAngleRadians(
                                self._pages[0].getProperty('oa') + Math.PI / points);

                            self._assignProperties([property, 'ia'],
                                [gMath.normalizeValue(points, 2, 360), innerAngle]);
                        } else {
                            self._updateProperties();
                        }
                        */
                    });
            } else if (property === 'bl' || property === 'w' || property === 'h') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '5em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'color') {
                return $('<button></button>')
                    .attr('data-property', 'color')
                    .gColorButton()
                    .on('change', function (evt) {
                        /*
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                        */
                    });
            } else if (property === 'size-preset') {
                return $('<select></select>')
                    .attr('data-property', 'size-preset')
                    .append(function () {
                        var result = [];

                        result.push($('<option></option>')
                            .attr('value', 'x')
                            // TODO : I18N
                            .text('Custom Size'));

                        for (var i = 0; i < GPageProperties.options.sizePresets.length; ++i) {
                            var group = GPageProperties.options.sizePresets[i];
                            var groupEl = $('<optgroup></optgroup>')
                                .attr('label', group.name);

                            result.push(groupEl);

                            for (var k = 0; k < group.sizes.length; ++k) {
                                var size = group.sizes[k];
                                $('<option></option>')
                                    .attr('value', i.toString() + ',' + k.toString())
                                    .text(size.name)
                                    .appendTo(groupEl);
                            }
                        }

                        return result;
                    }())
                    .on('change', function () {
                        // TODO
                    })
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
                    .text('Title:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('title'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Bleed:'))
                .append($('<td></td>')
                    .append(_createInput('bl')))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .css('text-align', 'right')
                    .append(_createInput('color'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .addClass('category')
                    .text('Dimensions')
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('size-preset'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Width:'))
                .append($('<td></td>')
                    .append(_createInput('w')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Height:'))
                .append($('<td></td>')
                    .append(_createInput('h'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .addClass('category')
                    .append($('<label></label>')
                        .append($('<input>')
                            .attr('type', 'checkbox')
                            .attr('data-property', 'evenodd')
                            .on('change', function () {
                                //self._assignProperty(property, $(this).is(':checked'));
                            }))
                        .append($('<span></span>')
                            // TODO : I18N
                            .html('&nbsp;Margins')))
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Top:'))
                .append($('<td></td>')
                    .append(_createInput('w')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Right:'))
                .append($('<td></td>')
                    .append(_createInput('h'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Left:'))
                .append($('<td></td>')
                    .append(_createInput('w')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Bottom:'))
                .append($('<td></td>')
                    .append(_createInput('h'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .addClass('category')
                    .append($('<label></label>')
                        .append($('<input>')
                            .attr('type', 'checkbox')
                            .attr('data-property', 'evenodd')
                            .on('change', function () {
                                //self._assignProperty(property, $(this).is(':checked'));
                            }))
                        .append($('<span></span>')
                            // TODO : I18N
                            .html('&nbsp;Grid')))
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Baseline:'))
                .append($('<td></td>')
                    .append(_createInput('w')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Gutter:'))
                .append($('<td></td>')
                    .append(_createInput('h'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Columns:'))
                .append($('<td></td>')
                    .append(_createInput('w')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Rows:'))
                .append($('<td></td>')
                    .append(_createInput('h'))))
            .appendTo(panel);
    };

    /** @override */
    GPageProperties.prototype.updateFromNodes = function (document, nodes) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXElement.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // Collect all page elements
        this._pages = [];
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] instanceof GXPage) {
                this._pages.push(nodes[i]);
            }
        }

        if (this._pages.length === nodes.length) {
            this._document = document;
            this._document.getScene().addEventListener(GXElement.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXElement.GeometryChangeEvent} event
     * @private
     */
    GPageProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first page has changed then update ourself
        if (this._pages.length > 0 && this._pages[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GPageProperties.prototype._updateProperties = function () {
        // We'll always read properties of first page
        var polygon = this._pages[0];
        this._panel.find('input[data-property="pts"]').val(polygon.getProperty('pts'));
        this._panel.find('input[data-property="evenodd"]').prop('checked', polygon.getProperty('evenodd'));
        this._panel.find('input[data-property="or"]').val(
            this._document.getScene().pointToString(polygon.getProperty('or')));
        this._panel.find('input[data-property="ir"]').val(
            this._document.getScene().pointToString(polygon.getProperty('ir')));
        this._panel.find('input[data-property="oa"]').val(
            gMath.round(gMath.toDegrees(gMath.PI2 - polygon.getProperty('oa')), 2).toString().replace('.', ','));
        this._panel.find('input[data-property="ia"]').val(
            gMath.round(gMath.toDegrees(gMath.PI2 - polygon.getProperty('ia')), 2).toString().replace('.', ','));
        this._panel.find('select[data-property="oct"]').val(polygon.getProperty('oct'));
        this._panel.find('select[data-property="ict"]').val(polygon.getProperty('ict'));
        this._panel.find('input[data-property="ocr"]').val(
            this._document.getScene().pointToString(polygon.getProperty('ocr')));
        this._panel.find('input[data-property="icr"]').val(
            this._document.getScene().pointToString(polygon.getProperty('icr')));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPageProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPageProperties.prototype._assignProperties = function (properties, values) {
        // TODO : Undo Group
        for (var i = 0; i < this._pages.length; ++i) {
            this._pages[i].setProperties(properties, values);
        }
    };

    /** @override */
    GPageProperties.prototype.toString = function () {
        return "[Object GPageProperties]";
    };

    _.GPageProperties = GPageProperties;
})(this);