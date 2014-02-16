(function (_) {

    /**
     * Polygon properties panel
     * @class EXPolygonProperties
     * @extends EXProperties
     * @constructor
     */
    function EXPolygonProperties() {
        this._polygons = [];
    };
    GObject.inherit(EXPolygonProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    EXPolygonProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    EXPolygonProperties.prototype._document = null;

    /**
     * @type {Array<GXPolygon>}
     * @private
     */
    EXPolygonProperties.prototype._polygons = null;

    /** @override */
    EXPolygonProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Polygon';
    };

    /** @override */
    EXPolygonProperties.prototype.init = function (panel, menu) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'pts') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', 'pts')
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var points = parseInt($(this).val());
                        if (!isNaN(points)) {
                            var innerAngle = gMath.normalizeAngleRadians(
                                self._polygons[0].getProperty('oa') + Math.PI / points);

                            self._assignProperties([property, 'ia'],
                                [gMath.normalizeValue(points, 2, 360), innerAngle]);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'evenodd') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-property', 'evenodd')
                        .on('change', function () {
                            self._assignProperty(property, $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;Even/odd'))
            } else if (property === 'ir' || property === 'or') {
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
            } else if (property === 'ia' || property === 'oa') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .gAutoBlur()
                    .on('change', function () {
                        var angle = parseFloat($(this).val());
                        if (!isNaN(angle)) {
                            angle = gMath.normalizeAngleRadians(gMath.toRadians(angle));
                            self._assignProperty(property, gMath.PI2 - angle);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'ict' || property === 'oct') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .css('width', '6em')
                    .gCornerType()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'icr' || property === 'ocr') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .gAutoBlur()
                    .on('change', function (evt) {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
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
                    .text('Points:'))
                .append($('<td></td>')
                    .append(_createInput('pts')))
                .append($('<td></td>')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createInput('evenodd'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .html('<i class="fa fa-square" style="-webkit-transform: rotate(45deg); transform: rotate(45deg)"></i>'))
                .append($('<td></td>')
                    .append(_createInput('or')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('<i class="fa fa-circle"></i>'))
                .append($('<td></td>')
                    .append(_createInput('ir'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Angle:'))
                .append($('<td></td>')
                    .append(_createInput('oa')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('<i class="fa fa-circle"></i>'))
                .append($('<td></td>')
                    .append(_createInput('ia'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Corner:'))
                .append($('<td></td>')
                    .append(_createInput('oct')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('<i class="fa fa-circle"></i>'))
                .append($('<td></td>')
                    .append(_createInput('ict'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Smooth:'))
                .append($('<td></td>')
                    .append(_createInput('ocr')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('<i class="fa fa-circle"></i>'))
                .append($('<td></td>')
                    .append(_createInput('icr'))))
            .appendTo(panel);
    };

    /** @override */
    EXPolygonProperties.prototype.updateFromNodes = function (document, nodes) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXElement.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // Collect all polygon elements
        this._polygons = [];
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] instanceof GXPolygon) {
                this._polygons.push(nodes[i]);
            }
        }

        if (this._polygons.length === nodes.length) {
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
    EXPolygonProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first polygon has changed then update ourself
        if (this._polygons.length > 0 && this._polygons[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    EXPolygonProperties.prototype._updateProperties = function () {
        // We'll always read properties of first polygon
        var polygon = this._polygons[0];
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
    EXPolygonProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    EXPolygonProperties.prototype._assignProperties = function (properties, values) {
        // TODO : Undo Group
        for (var i = 0; i < this._polygons.length; ++i) {
            this._polygons[i].setProperties(properties, values);
        }
    };

    /** @override */
    EXPolygonProperties.prototype.toString = function () {
        return "[Object EXPolygonProperties]";
    };

    _.EXPolygonProperties = EXPolygonProperties;
})(this);