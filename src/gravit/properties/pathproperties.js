(function (_) {

    /**
     * Path properties panel
     * @class GPathProperties
     * @extends EXProperties
     * @constructor
     */
    function GPathProperties() {
        this._pathes = [];
    };
    GObject.inherit(GPathProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GPathProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GPathProperties.prototype._document = null;

    /**
     * @type {Array<GXPath>}
     * @private
     */
    GPathProperties.prototype._pathes = null;

    /**
     * @type {Array<GXPathBase.AnchorPoint>}
     * @private
     */
    GPathProperties.prototype._points = null;

    /** @override */
    GPathProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Path';
    };

    /** @override */
    GPathProperties.prototype.init = function (panel, menu) {
        this._panel = panel;

        var _createPathInput = function (property) {
            var self = this;
            if (property === 'evenodd' || property === 'closed') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-path-property', property)
                        .on('change', function () {
                            self._assignPathProperty(property, $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;' + (property === 'evenodd' ? 'Even/odd' : 'Closed')))
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        var _createPointInput = function (property) {
            var self = this;
            if (property === 'x' || property === 'y' || property === 'cl' || property === 'cr') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-point-property', property)
                    .css('width', '5em')
                    .gAutoBlur()
                    .on('change', function (evt) {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignPointProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updatePointProperties();
                        }
                    });
            } else if (property === 'tp') {
                return $('<select></select>')
                    .attr('data-point-property', property)
                    .css('width', '100%')
                    .append($('<option></option>')
                        .attr('value', GXPathBase.AnchorPoint.Type.Smooth)
                        .text('Smooth'))
                    .append($('<option></option>')
                        .attr('value', GXPathBase.AnchorPoint.Type.Regular)
                        .text('Regular'))
                    .append($('<option></option>')
                        .attr('value', GXPathBase.AnchorPoint.Type.Connector)
                        .text('Connector'))
                    .gCornerType()
                    .on('change', function () {
                        self._assignPointProperty(property, $(this).val());
                    });
            } if (property === 'ah') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-point-property', property)
                        .on('change', function () {
                            self._assignPointProperty(property, $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;Auto-Handles'))
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
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createPathInput('evenodd')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createPathInput('closed'))))
            .append($('<tr></tr>')
                .attr('colspan', '4')
                .append($('<td></td>')))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('X:'))
                .append($('<td></td>')
                    .append(_createPointInput('x')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Y:'))
                .append($('<td></td>')
                    .append(_createPointInput('y'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Type:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createPointInput('tp'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Handles:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<button></button>')
                        .append($('<span></span>')
                            .addClass('fa fa-arrow-right'))
                        .on('click', function () {
                            this._assignPointProperties(['hlx', 'hly'], [null, null]);
                        }.bind(this)))
                    .append($('<button></button>')
                        .append($('<span></span>')
                            .addClass('fa fa-arrow-left'))
                        .on('click', function () {
                            this._assignPointProperties(['hrx', 'hry'], [null, null]);
                        }.bind(this)))
                    .append(_createPointInput('ah'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Smooth:'))
                .append($('<td></td>')
                    .append(_createPointInput('cl')))
                .append($('<td></td>')
                    .addClass('label'))
                .append($('<td></td>')
                    .append(_createPointInput('cr'))))
            .appendTo(panel);
    };

    /** @override */
    GPathProperties.prototype.updateFromNodes = function (document, nodes) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXElement.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document.getScene().removeEventListener(GXElement.AfterFlagChangeEvent, this._afterFlagChange);
            this._document = null;
        }

        // Collect all path elements and their selected anchor points
        this._pathes = [];
        this._points = [];
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] instanceof GXPath) {
                var path = nodes[i];
                
                this._pathes.push(nodes[i]);
                
                for (var ap = path.getAnchorPoints().getFirstChild(); ap !== null; ap = ap.getNext()) {
                    if (ap.hasFlag(GXNode.Flag.Selected)) {
                        this._points.push(ap);
                    }
                }
            }
        }

        if (this._pathes.length === nodes.length) {
            this._document = document;
            this._document.getScene().addEventListener(GXElement.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getScene().addEventListener(GXElement.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._updatePathProperties();
            this._updatePointProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXElement.AfterPropertiesChangeEvent} event
     * @private
     */
    GPathProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first path has changed then update ourself
        if (this._pathes.length > 0 && this._pathes[0] === event.node) {
            this._updatePathProperties();
        }
        // If properties of first anchor point has changed then update ourself
        if (this._points.length > 0 && this._points[0] === event.node) {
            this._updatePointProperties();
        }
    };

    /**
     * @param {GXElement.AfterFlagChangeEvent} event
     * @private
     */
    GPathProperties.prototype._afterFlagChange = function (event) {
        if (event.flag === GXNode.Flag.Selected && event.node instanceof GXPathBase.AnchorPoint) {
            var path = event.node.getParent().getParent();
            if (path && this._pathes.indexOf(path) >= 0) {
                if (event.set) {
                    this._points.push(event.node);
                } else {
                    this._points.splice(this._points.indexOf(event.node), 1);
                }
                this._updatePointProperties();
            }
        }
    };

    /**
     * @private
     */
    GPathProperties.prototype._updatePathProperties = function () {
        // We'll always read properties of first path
        var path = this._pathes[0];
        this._panel.find('input[data-path-property="evenodd"]').prop('checked', path.getProperty('evenodd'));
        this._panel.find('input[data-path-property="closed"]').prop('checked', path.getProperty('closed'));
    };

    /**
     * @private
     */
    GPathProperties.prototype._updatePointProperties = function () {
        // We'll always read properties of first anchor point if any
        var point = this._points.length > 0 ? this._points[0] : null;

        if (point) {
            this._panel.find('[data-point-property]').css('visibility', '');
            this._panel.find('input[data-point-property="x"]').val(
                this._document.getScene().pointToString(point.getProperty('x')));
            this._panel.find('input[data-point-property="y"]').val(
                this._document.getScene().pointToString(point.getProperty('y')));
            this._panel.find('select[data-point-property="tp"]').val(point.getProperty('tp'));
            this._panel.find('input[data-point-property="ah"]').prop('checked', point.getProperty('ah'));
            this._panel.find('input[data-point-property="cl"]').val(
                this._document.getScene().pointToString(point.getProperty('cl')));
            this._panel.find('input[data-point-property="cr"]').val(
                this._document.getScene().pointToString(point.getProperty('cr')));
        } else {
            this._panel.find('[data-point-property]').css('visibility', 'hidden');
        }
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPathProperties.prototype._assignPathProperty = function (property, value) {
        this._assignPathProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPathProperties.prototype._assignPathProperties = function (properties, values) {
        // TODO : I18N
        var pathes = this._pathes.slice();
        this._document.getEditor().executeTransaction(function () {
            for (var i = 0; i < pathes.length; ++i) {
                pathes[i].setProperties(properties, values);
            }
        }, pathes, 'Path Properties');
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPathProperties.prototype._assignPointProperty = function (property, value) {
        this._assignPointProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPathProperties.prototype._assignPointProperties = function (properties, values) {
        // TODO : I18N
        var points = this._points.slice();
        this._document.getEditor().executeTransaction(function () {
            for (var i = 0; i < points.length; ++i) {
                points[i].setProperties(properties, values);
            }
        }, points, 'Point Properties');
    };

    /** @override */
    GPathProperties.prototype.toString = function () {
        return "[Object GPathProperties]";
    };

    _.GPathProperties = GPathProperties;
})(this);