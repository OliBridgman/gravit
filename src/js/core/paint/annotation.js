(function (_) {

    /**
     * @class GAnnotation
     * @constructor
     * @version 1.0
     */
    function GAnnotation() {
    };

    /**
     * Type of an annotation
     * @enum
     */
    GAnnotation.prototype.AnnotType = {
        Rectangle: 0,
        Circle: 1,
        Diamond: 2
    };

    var _annotationTemplates = {};

    /**
     * Paint an annotation
     * @param {GPaintContext} context the paint context to paint on
     * @param {GTransform} transform the current transformation in use
     * @param {GPoint} center the center point of the annotation
     * @param {GAnnotation.AnnotType} annotation the annotation to be painted
     * @param {Boolean} [selected] whether the annotation should be painted
     * selected or not. Defaults to false.
     * @param {Number} [size] annotation size
     * @param {GColor} [stroke] annotation stroke color, if not provided uses defaults
     * @param {GColor} [fill] annotation fill color, if not provided uses defaults
     */
    GAnnotation.prototype.paintAnnotation = function (context, transform, center, annotation, selected, size, stroke, fill) {
        var annotationTemplate = this._getAnnotationTemplate(annotation);

        // Now paint our annotation
        if (transform) {
            center = transform.mapPoint(center);
        }

        var fillColor = fill ? fill : context.selectionOutlineColor;
        var strokeColor = stroke ? stroke : null;
        if (selected) {
            strokeColor = fillColor;
            fillColor = GRGBColor.WHITE;
        }

        var cx = Math.floor(center.getX()) + (strokeColor ? 0.5 : 0);
        var cy = Math.floor(center.getY()) + (strokeColor ? 0.5 : 0);
        var sx = size / 2 / annotationTemplate.scaleFactor;
        var sy = size / 2 / annotationTemplate.scaleFactor;
        var canvas = context.canvas;

        var vertices = new GVertexTransformer(annotationTemplate.vertices, new GTransform(sx, 0, 0, sy, cx, cy));
        canvas.putVertices(vertices);
        canvas.fillVertices(fillColor);
        // TODO : Transform and fill with stroke first, then fill to avoid expensive stroke operations for annotations at all
        if (strokeColor) {
            canvas.strokeVertices(strokeColor, 1);
        }
    };


    /**
     * Get bbox of an annotation
     * @param {GTransform} transform the current transformation in use
     * @param {GPoint} center the center point of the annotation
     * @param {Number} [size] the size of an anotation
     */
    GAnnotation.prototype.getAnnotationBBox = function (transform, center, size) {
        if (transform) {
            center = transform.mapPoint(center);
        }

        var cx = Math.floor(center.getX()) + 0.5;
        var cy = Math.floor(center.getY()) + 0.5;

        return new GRect(cx - size / 2 - 1, cy - size / 2 - 1, size + 2, size + 2);
    };

    GAnnotation.prototype._getAnnotationTemplate = function (annotation) {
        // Prepare vertex cache, first
        var annotationTemplate = _annotationTemplates[annotation];
        if (!annotationTemplate) {
            var vertices = new GVertexContainer();
            var scaleFactor = 1;

            switch (annotation) {
                case this.AnnotType.Rectangle:
                    vertices.addVertex(GVertex.Command.Move, -1, -1);
                    vertices.addVertex(GVertex.Command.Line, 1, -1);
                    vertices.addVertex(GVertex.Command.Line, 1, 1);
                    vertices.addVertex(GVertex.Command.Line, -1, 1);
                    vertices.addVertex(GVertex.Command.Close);
                    break;

                case this.AnnotType.Circle:
                    vertices.addVertex(GVertex.Command.Move, -1, 0);
                    vertices.addVertex(GVertex.Command.Curve, 0, -1);
                    vertices.addVertex(GVertex.Command.Curve, -1, -1);
                    vertices.addVertex(GVertex.Command.Curve, 1, 0);
                    vertices.addVertex(GVertex.Command.Curve, 1, -1);
                    vertices.addVertex(GVertex.Command.Curve, 0, 1);
                    vertices.addVertex(GVertex.Command.Curve, 1, 1);
                    vertices.addVertex(GVertex.Command.Curve, -1, 0);
                    vertices.addVertex(GVertex.Command.Curve, -1, 1);
                    break;

                case this.AnnotType.Diamond:
                    vertices.addVertex(GVertex.Command.Move, -1, 0);
                    vertices.addVertex(GVertex.Command.Line, 0, -1);
                    vertices.addVertex(GVertex.Command.Line, 1, 0);
                    vertices.addVertex(GVertex.Command.Line, 0, 1);
                    vertices.addVertex(GVertex.Command.Close);
                    scaleFactor = Math.cos(Math.PI / 4);
                    break;
            }

            annotationTemplate = {
                vertices: vertices,
                scaleFactor: scaleFactor
            }
            _annotationTemplates[annotation] = annotationTemplate;
        }
        return annotationTemplate;
    };

    _.ifAnnotation = new GAnnotation();
})(this);