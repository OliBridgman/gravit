(function (_) {

    /**
     * Dimension properties panel
     * @class GDimensionsProperties
     * @extends GProperties
     * @constructor
     */
    function GDimensionsProperties() {
        this._elements = [];
    };
    IFObject.inherit(GDimensionsProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GDimensionsProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GDimensionsProperties.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GDimensionsProperties.prototype._elements = null;

    /**
     * @type {IFRect}
     * @private
     */
    GDimensionsProperties.prototype._elementsBBox = null;

    /**
     * @type {IFRect}
     * @private
     */
    GDimensionsProperties.prototype._firstElementsBBox = null;

    /** @override */
    GDimensionsProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Dimensions';
    };

    /** @override */
    GDimensionsProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createDimensionInput = function (dimension) {
            var self = this;
            return $('<input>')
                .attr('type', 'text')
                .attr('data-dimension', dimension)
                .css('width', '3em')
                .on('change', function (evt) {
                    self._assignDimension(dimension, $(this).val());
                });
        }.bind(this);

        // Init panel
        $('<table></table>')
            .addClass('g-form')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .append($('<input>')
                        .css('width', '100%')
                        .attr('data-name', '')
                        .on('change', function (evt) {
                            IFEditor.tryRunTransaction(this._elements[0], function () {
                                this._elements[0].setProperty('name', $(evt.target).val());
                            }.bind(this), 'Rename Element');
                        }.bind(this)))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('W:'))
                .append($('<td></td>')
                    .append(_createDimensionInput('w')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('x:'))
                .append($('<td></td>')
                    .append(_createDimensionInput('x'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('H:'))
                .append($('<td></td>')
                    .append(_createDimensionInput('h')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Y:'))
                .append($('<td></td>')
                    .append(_createDimensionInput('y'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .append($('<label></label>')
                        .append($('<input>')
                            .attr('type', 'checkbox')
                            .attr('data-apply', '')
                            .on('change', function () {
                                this._updateDimensions(true);
                            }.bind(this)))
                        .append($('<span></span>')
                            .html('&nbsp;Apply to Selection')))))
            .appendTo(panel);
    };

    /** @override */
    GDimensionsProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFElement.GeometryChangeEvent, this._geometryChange);
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // Collect all transformable elements
        this._elements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFElement && elements[i].hasMixin(IFElement.Transform)) {
                this._elements.push(elements[i]);
            }
        }

        if (this._elements.length > 0) {
            this._document = document;
            this._document.getScene().addEventListener(IFElement.GeometryChangeEvent, this._geometryChange, this);
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._panel.find('input[data-apply]').css('display', this._elements.length <= 1 ? 'none' : '')
            this._panel.find('input[data-name]')
                .prop('disabled', this._elements.length > 1)
                .val(this._elements.length === 1 && this._elements[0] instanceof IFBlock ? this._elements[0].getProperty('name') : (this._elements.length.toString() + ' Elements'));
            this._updateDimensions();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFElement.GeometryChangeEvent} event
     * @private
     */
    GDimensionsProperties.prototype._geometryChange = function (event) {
        if ((event.type === IFElement.GeometryChangeEvent.Type.After) ||
            (event.type === IFElement.GeometryChangeEvent.Type.Child))
            if (this._elements.indexOf(event.element) >= 0) {
                this._updateDimensions();
            }
    };

    /**
     * @param {IFElement.GeometryChangeEvent} event
     * @private
     */
    GDimensionsProperties.prototype._afterPropertiesChange = function (event) {
        if (this._elements && this._elements.length === 1 && this._elements[0] === event.node && event.properties.indexOf('name') >= 0) {
            this._panel.find('input[data-name]').val(this._elements[0].getProperty('name'));
        }
    };

    /**
     * @param {Boolean} [noBBoxCalculation] if set, do not recalculate all element's bbox.
     * Defaults to false.
     * @private
     */
    GDimensionsProperties.prototype._updateDimensions = function (noBBoxCalculation) {
        var _updateDimension = function (dimension, value) {
            this._panel.find('input[data-dimension="' + dimension + '"]').val(this._document.getScene().pointToString(value));
        }.bind(this);

        if (!noBBoxCalculation) {
            this._elementsBBox = null;
            this._firstElementsBBox = null;
            for (var i = 0; i < this._elements.length; ++i) {
                var bbox = this._elements[i].getGeometryBBox();
                if (bbox && !bbox.isEmpty()) {
                    this._elementsBBox = this._elementsBBox ? this._elementsBBox.united(bbox) : bbox;

                    if (!this._firstElementsBBox) {
                        this._firstElementsBBox = bbox;
                    }
                }
            }

            if (!this._elementsBBox) {
                this._elementsBBox = new IFRect(0, 0, 0, 0);
                this._firstElementsBBox = this._elementsBBox;
            }
        }

        var applyToSelection = this._elements.length > 1 && this._panel.find('input[data-apply]').is(':checked');
        var delta = this._getDelta();

        if (applyToSelection) {
            _updateDimension('x', this._elementsBBox.getX() - delta.getX());
            _updateDimension('y', this._elementsBBox.getY() - delta.getY());
            _updateDimension('w', this._elementsBBox.getWidth());
            _updateDimension('h', this._elementsBBox.getHeight());
        } else {
            _updateDimension('x', this._firstElementsBBox.getX() - delta.getX());
            _updateDimension('y', this._firstElementsBBox.getY() - delta.getY());
            _updateDimension('w', this._firstElementsBBox.getWidth());
            _updateDimension('h', this._firstElementsBBox.getHeight());
        }
    };

    /**
     * @private
     */
    GDimensionsProperties.prototype._assignDimension = function (dimension, valueString) {
        var value = this._document.getScene().stringToPoint(valueString);

        // Check for invalid value and if it is invalid, reset dimension values and return here
        if (value === null || typeof value !== 'number' || ((dimension === 'w' || dimension == 'h') && value <= 0)) {
            this._updateDimensions();
            return;
        }

        // Correct x,y for delta if any
        if (dimension === 'x' || dimension === 'y') {
            var delta = this._getDelta();
            switch (dimension) {
                case 'x':
                    value += delta.getX();
                    break;
                case 'y':
                    value += delta.getY();
                    break;
                default:
                    break;
            }
        }

        var _getTransformation = function (bbox) {
            switch (dimension) {
                case 'x':
                    return new IFTransform()
                        .translated(value - bbox.getX(), 0);
                case 'y':
                    return new IFTransform()
                        .translated(0, value - bbox.getY());
                case 'w':
                    return new IFTransform()
                        .translated(-bbox.getX(), -bbox.getY())
                        .scaled(value / bbox.getWidth(), 1)
                        .translated(bbox.getX(), bbox.getY());
                case 'h':
                    return new IFTransform()
                        .translated(-bbox.getX(), -bbox.getY())
                        .scaled(1, value / bbox.getHeight())
                        .translated(bbox.getX(), bbox.getY());
                default:
                    break;
            }
        };

        var applyToSelection = this._elements.length > 1 && this._panel.find('input[data-apply]').is(':checked');

        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            if (applyToSelection) {
                var transform = _getTransformation(this._elementsBBox);
                for (var i = 0; i < this._elements.length; ++i) {
                    this._elements[i].transform(transform);
                }
            } else {
                for (var i = 0; i < this._elements.length; ++i) {
                    var transform = _getTransformation(this._elements[i].getGeometryBBox());
                    this._elements[i].transform(transform);
                }
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Dimensions');
        }
    };

    /**
     * @returns {IFPoint}
     * @private
     */
    GDimensionsProperties.prototype._getDelta = function () {
        var scene = this._document.getScene();
        if (scene.getProperty('singlePage') === true) {
            var activePage = scene.getActivePage();
            if (activePage) {
                return activePage.getGeometryBBox().getSide(IFRect.Side.TOP_LEFT);
            }
        }

        return new IFPoint(0, 0);
    }

    /** @override */
    GDimensionsProperties.prototype.toString = function () {
        return "[Object GDimensionsProperties]";
    };

    _.GDimensionsProperties = GDimensionsProperties;
})(this);