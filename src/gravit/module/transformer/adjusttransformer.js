(function (_) {

    /**
     * Transform transform panel
     * @class GAdjustTransformer
     * @extends GTransformer
     * @constructor
     */
    function GAdjustTransformer() {
        this._elements = [];
    };
    IFObject.inherit(GAdjustTransformer, GTransformer);

    GAdjustTransformer._TransformMode = {
        Move: 'move',
        Scale: 'scale',
        Rotate: 'rotate',
        Skew: 'skew',
        Reflect: 'reflect'
    };

    /**
     * @type {JQuery}
     * @private
     */
    GAdjustTransformer.prototype._panel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GAdjustTransformer.prototype._controls = null;

    /**
     * @type {GDocument}
     * @private
     */
    GAdjustTransformer.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GAdjustTransformer.prototype._elements = null;

    /**
     * @type {GAdjustTransformer._TransformMode}
     * @private
     */
    GAdjustTransformer.prototype._transformMode = null;

    /** @override */
    GAdjustTransformer.prototype.getCategory = function () {
        // TODO : I18N
        return 'Adjust';
    };

    /** @override */
    GAdjustTransformer.prototype.init = function (panel, controls) {
        this._panel = panel;
        this._controls = controls;

        // Controls
        $('<button></button>')
            .addClass('fa fa-arrows')
            // TODO : I18N
            .attr('title', 'Move')
            .attr('data-mode', GAdjustTransformer._TransformMode.Move)
            .appendTo(controls);
        $('<button></button>')
            .addClass('fa fa-expand')
            // TODO : I18N
            .attr('title', 'Scale')
            .attr('data-mode', GAdjustTransformer._TransformMode.Scale)
            .appendTo(controls);
        $('<button></button>')
            .addClass('fa fa-rotate-right')
            // TODO : I18N
            .attr('title', 'Rotate')
            .attr('data-mode', GAdjustTransformer._TransformMode.Rotate)
            .appendTo(controls);
        $('<button></button>')
            .addClass('fa fa-eraser')
            // TODO : I18N
            .attr('title', 'Skew')
            .attr('data-mode', GAdjustTransformer._TransformMode.Skew)
            .appendTo(controls);
        $('<button></button>')
            .addClass('fa fa-star-half-o')
            // TODO : I18N
            .attr('title', 'Reflect')
            .attr('data-mode', GAdjustTransformer._TransformMode.Reflect)
            .appendTo(controls);

        $('<button></button>')
            // TODO : I18N
            .css('margin-left', '7px')
            // TODO : I18N
            .text('APPLY')
            .on('click', this._apply.bind(this))
            .appendTo(controls);

        controls.find('button[data-mode]').each(function (index, element) {
            var $element = $(element);
            $element.on('click', function () {
                this._setTransformMode($element.attr('data-mode'));
            }.bind(this))
        }.bind(this));


        var _createDimensionInput = function (dimension) {
            var self = this;
            return $('<input>')
                .attr('type', 'text')
                .attr('data-dimension', dimension)
                .css('width', '5em')
                .on('change', function (evt) {
                    self._assignDimension(dimension, $(this).val());
                });
        }.bind(this);

        // Content
        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Pivot:'))
                .append($('<td></td>')
                    .append($('<div></div>')
                        .attr('data-property', 'pivot')
                        .css('display', 'inline-block')
                        .gPivot()
                        .on('pivotchange', function (evt, side) {
                            //alert('NEW PIVOT SIDE: ' + side);
                        })))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Copies:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '4em')
                        .attr('data-property', 'copies')
                        .val('0'))))
            .append($('<tr></tr>')
                .attr('data-mode', GAdjustTransformer._TransformMode.Move)
                .append($('<td></td>')
                    .addClass('label')
                    .text('X:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '5em')
                        .attr('data-property', 'x')
                        .val('0')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Y:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '5em')
                        .attr('data-property', 'y')
                        .val('0'))))
            .append($('<tr></tr>')
                .attr('data-mode', GAdjustTransformer._TransformMode.Scale)
                .append($('<td></td>')
                    .addClass('label')
                    .text('W:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '4em')
                        .attr('data-property', 'w')
                        .val('100'))
                    .append($('<span></span>')
                        .text('%')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('H:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '4em')
                        .attr('data-property', 'h')
                        .val('100'))
                    .append($('<span></span>')
                        .text('%'))))
            .append($('<tr></tr>')
                .attr('data-mode', GAdjustTransformer._TransformMode.Rotate)
                .append($('<td></td>')
                    .addClass('label')
                    .text('Angle:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '4em')
                        .attr('data-property', 'angle')
                        .val('0'))
                    .append($('<span></span>')
                        .text('°')))
                .append($('<td></td>')
                    .attr('colspan', '2')))
            .append($('<tr></tr>')
                .attr('data-mode', GAdjustTransformer._TransformMode.Skew)
                .append($('<td></td>')
                    .addClass('label')
                    .text('X:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '4em')
                        .attr('data-property', 'x')
                        .val('0'))
                    .append($('<span></span>')
                        .text('°')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Y:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '4em')
                        .attr('data-property', 'y')
                        .val('0'))
                    .append($('<span></span>')
                        .text('°'))))
            .append($('<tr></tr>')
                .attr('data-mode', GAdjustTransformer._TransformMode.Reflect)
                .append($('<td></td>')
                    .addClass('label')
                    .text('Axis:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .css('width', '4em')
                        .attr('data-property', 'axis')
                        .val('0'))
                    .append($('<span></span>')
                        .text('°')))
                .append($('<td></td>')
                    .attr('colspan', '2')))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .css('display', 'none')
                    .attr('colspan', '4')))
            .appendTo(panel);

        this._setTransformMode(GAdjustTransformer._TransformMode.Move);
    };

    /** @override */
    GAdjustTransformer.prototype.update = function (document, elements) {
        this._document = document;
        this._elements = elements;

        this._panel.find('[data-property="pivot"]').gPivot('value', IFRect.Side.CENTER);

        return true;
    };

    GAdjustTransformer.prototype._setTransformMode = function (mode) {
        this._transformMode = mode;

        this._controls.find('button[data-mode]').each(function (index, element) {
            var $element = $(element);
            $element.toggleClass('g-active', $element.attr('data-mode') === mode);
        }.bind(this));

        this._panel.find('tr[data-mode]').each(function (index, element) {
            var $element = $(element);
            $element.css('display', $element.attr('data-mode') === mode ? '' : 'none');
        });
    };

    /**
     * @private
     */
    GAdjustTransformer.prototype._apply = function () {
        var scene = this._document.getScene();

        var copies = parseInt(this._panel.find('[data-property="copies"]').val());
        var pivot = this._panel.find('[data-property="pivot"]').gPivot('value');

        /** Function(step, element) */
        var transformFunc = null;
        var transformRows = this._panel.find('[data-mode="' + this._transformMode + '"]');

        if (this._transformMode === GAdjustTransformer._TransformMode.Move) {
            var tx = scene.stringToPoint(transformRows.find('[data-property="x"]').val()) || 0;
            var ty = scene.stringToPoint(transformRows.find('[data-property="y"]').val()) || 0;

            if (tx !== 0 || ty !== 0) {
                transformFunc = function (step, element, origin) {
                    element.transform(new IFTransform(1, 0, 0, 1, tx * step, ty * step));
                }
            }
        } else if (this._transformMode === GAdjustTransformer._TransformMode.Scale) {
            var sx = parseFloat(transformRows.find('[data-property="w"]').val()) / 100.0 || 1;
            var sy = parseFloat(transformRows.find('[data-property="h"]').val()) / 100.0 || 1;

            if (sx !== 1 || sy !== 1) {
                transformFunc = function (step, element, origin) {
                    element.transform(new IFTransform()
                        .translated(-origin.getX(), -origin.getY())
                        .scaled(sx + (sx - 1) * (step - 1), sy + (sy - 1) * (step - 1))
                        .translated(origin.getX(), origin.getY()));
                }
            }
        } else if (this._transformMode === GAdjustTransformer._TransformMode.Rotate) {
            var angle = ifMath.toRadians(parseFloat(transformRows.find('[data-property="angle"]').val())) || 0;

            if (angle !== 0) {
                transformFunc = function (step, element, origin) {
                    element.transform(new IFTransform()
                        .translated(-origin.getX(), -origin.getY())
                        .rotated(-angle * step)
                        .translated(origin.getX(), origin.getY()));
                }
            }
        } else if (this._transformMode === GAdjustTransformer._TransformMode.Skew) {
            var sx = ifMath.toRadians(parseFloat(transformRows.find('[data-property="x"]').val())) || 0;
            var sy = ifMath.toRadians(parseFloat(transformRows.find('[data-property="y"]').val())) || 0;

            if ((sx !== 0 || sy !== 0) && (sx > -ifMath.PIHALF && sy > -ifMath.PIHALF && sx < ifMath.PIHALF && sy < ifMath.PIHALF)) {
                transformFunc = function (step, element, origin) {
                    element.transform(new IFTransform()
                        .translated(-origin.getX(), -origin.getY())
                        .skewed(sx * step, sy * step)
                        .translated(origin.getX(), origin.getY()));
                }
            }
        } else if (this._transformMode === GAdjustTransformer._TransformMode.Reflect) {
            var angle = parseFloat(transformRows.find('[data-property="axis"]').val()) || 0;
            //var axis = angle === 90 ? 0 : Math.tan(ifMath.toRadians(angle)) || 0;
            angle = ifMath.toRadians(-angle);
            var cosA = Math.cos(angle);
            var sinA = Math.sin(angle);

            transformFunc = function (step, element, origin) {
                if (step % 2) {
                    element.transform(new IFTransform()
                        .translated(-origin.getX(), -origin.getY())
                        .multiplied(new IFTransform(cosA, -sinA, sinA, cosA, 0, 0))
                        .multiplied(new IFTransform(1, 0, 0, -1, 0, 0))
                        .multiplied(new IFTransform(cosA, sinA, -sinA, cosA, 0, 0))
                        .translated(origin.getX(), origin.getY()));
                }
            }
        }

        if (transformFunc) {
            // TODO : I18N
            IFEditor.tryRunTransaction(scene, function () {
                var transformElements = [];
                var bbox = null;
                for (var i = 0; i < this._elements.length; ++i) {
                    var element = this._elements[i];
                    if (pivot) {
                        bbox = bbox ? bbox.united(element.getGeometryBBox()) : element.getGeometryBBox();
                    }
                    var elementElements = [element];

                    if (copies > 0) {
                        var parent = element.getParent();
                        var insertReference = element.getNext() ? element.getNext() : null;
                        for (var c = 0; c < copies; ++c) {
                            var clone = element.clone();
                            parent.insertChild(clone, insertReference);
                            elementElements.push(clone);
                        }
                    }
                    transformElements.push(elementElements);
                }

                var pivotPt = null;
                if (bbox && !bbox.isEmpty()) {
                    pivotPt = bbox.getSide(pivot);
                }
                for (var i = 0; i < transformElements.length; ++i) {
                    var elementElements = transformElements[i];
                    for (var step = 1; step <= elementElements.length; ++step) {
                        transformFunc(step, elementElements[step - 1], pivotPt);
                    }
                }
            }.bind(this), 'Adjust Transformation');
        }
    };

    /** @override */
    GAdjustTransformer.prototype.toString = function () {
        return "[Object GAdjustTransformer]";
    };

    _.GAdjustTransformer = GAdjustTransformer;
})(this);