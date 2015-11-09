(function (_) {
    /**
     * The project sidebar
     * @class GProjectSidebar
     * @extends GSidebar
     * @constructor
     */
    function GProjectSidebar() {
        GSidebar.call(this);
    }

    GObject.inherit(GProjectSidebar, GSidebar);

    GProjectSidebar.ID = "project";
    GProjectSidebar.TITLE = new GLocale.Key(GProjectSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GProjectSidebar.prototype._htmlElement = null;

    /**
     * @type {GProject}
     * @private
     */
    GProjectSidebar.prototype._project = null;

    /** @override */
    GProjectSidebar.prototype.getId = function () {
        return GProjectSidebar.ID;
    };

    /** @override */
    GProjectSidebar.prototype.getTitle = function () {
        return GProjectSidebar.TITLE;
    };

    /** @override */
    GProjectSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw" style="height: 1em; background: url(/assets/application/icon/icon_72x72.png) no-repeat center center/1em"></span>';
    };

    /** @override */
    GProjectSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        gApp.addEventListener(GApplication.ProjectEvent, this._projectEvent, this);

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
                        var angle = GLength.parseEquationValue($(this).val());
                        if (angle !== null) {
                            angle = GMath.normalizeAngleRadians(GMath.toRadians(angle));
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
            } else if (property === 'pathImage' || property === 'pathFont' || property === 'pathExport') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '8em')
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css({
                'margin': '5px auto'
            })
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Unit:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('unit'))))
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
                    .append(_createInput('gridActive')
                        .attr('title', 'Show Grid'))))
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
            .appendTo(htmlElement);


        /*
        $('<table></table>')
            .addClass('g-form')
            .css({
                'margin': '5px auto'
            })
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Unit/Snap:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('unit'))
                    .append(_createInput('unitSnap')
                        // TODO : I18N
                        .attr('title', 'Snap to Units'))))
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
                    .append(_createInput('gridActive')
                        .attr('title', 'Show Grid'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
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
                    .attr('colspan', '4')
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Pathes'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Images:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathImage')
                        // TODO : I18N
                        .attr('title', 'Path for imported image assets'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Fonts:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathFont')
                        // TODO : I18N
                        .attr('title', 'Path for imported font assets'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Export:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathExport')
                        // TODO : I18N
                        .attr('title', 'Path for exported assets'))))
            .appendTo(htmlElement);
        */
    };

    /** @override */
    GProjectSidebar.prototype.isEnabled = function () {
        return !!this._project;
    };

    GProjectSidebar.prototype._projectEvent = function (event) {
        if (event.type === GApplication.ProjectEvent.Type.Activated) {
            this._project = event.project;
            this._updateProperties();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.ProjectEvent.Type.Deactivated) {
            this._project = null;
            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @private
     */
    GProjectSidebar.prototype._updateProperties = function () {
        /*
        this._htmlElement.find('select[data-property="unit"]').val(scene.getProperty('unit'));
        this._htmlElement.find('input[data-property="unitSnap"]').prop('checked', scene.getProperty('unitSnap'));
        this._htmlElement.find('input[data-property="gridSizeX"]').val(scene.pointToString(scene.getProperty('gridSizeX')));
        this._htmlElement.find('input[data-property="gridSizeY"]').val(scene.pointToString(scene.getProperty('gridSizeY')));
        this._htmlElement.find('input[data-property="gridActive"]').prop('checked', scene.getProperty('gridActive'));
        this._htmlElement.find('input[data-property="crDistSmall"]').val(scene.pointToString(scene.getProperty('crDistSmall')));
        this._htmlElement.find('input[data-property="crDistBig"]').val(scene.pointToString(scene.getProperty('crDistBig')));
        this._htmlElement.find('input[data-property="crConstraint"]').val(
            GUtil.formatNumber(GMath.toDegrees(scene.getProperty('crConstraint')), 2));
        this._htmlElement.find('input[data-property="snapDist"]').val(scene.pointToString(scene.getProperty('snapDist')));
        this._htmlElement.find('input[data-property="pickDist"]').val(scene.pointToString(scene.getProperty('pickDist')));
        this._htmlElement.find('input[data-property="pathImage"]').val(scene.getProperty('pathImage'));
        this._htmlElement.find('input[data-property="pathFont"]').val(scene.getProperty('pathFont'));
        this._htmlElement.find('input[data-property="pathExport"]').val(scene.getProperty('pathExport'));
        */
    };

    /** @override */
    GProjectSidebar.prototype.toString = function () {
        return "[Object GProjectSidebar]";
    };

    _.GProjectSidebar = GProjectSidebar;
})(this);