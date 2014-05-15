(function (_) {
    /**
     * An editor for a text
     * @param {GXText} text the text this editor works on
     * @class GXTextEditor
     * @extends GXShapeEditor
     * @constructor
     */
    function GXTextEditor(rectangle) {
        GXShapeEditor.call(this, rectangle);
        this._flags |= GXBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GXTextEditor, GXShapeEditor);
    GXElementEditor.exports(GXTextEditor, GXText);

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GXTextEditor.prototype._inlineEditor = null;

    /** @override */
    GXTextEditor.prototype.initialSetup = function (fillColor, strokeColor) {
        // Text will always retrieve a black fill if there's no other fill
        GXShapeEditor.prototype.initialSetup.call(this, fillColor ? fillColor : new GXColor(GXColor.Type.Black), null);
    };

    /** @override */
    GXTextEditor.prototype.canInlineEdit = function () {
        return true;
    };

    /** @override */
    GXTextEditor.prototype.isInlineEdit = function () {
        return this._inlineEditor !== null;
    };

    /** @override */
    GXTextEditor.prototype.beginInlineEdit = function (view, container) {
        this.removeFlag(GXBlockEditor.Flag.ResizeAll);

        this._inlineEditor = $(this.getElement().asHtml())
            .css({
                'position': 'absolute',
                'z-index': '99999',
                'background': 'white',
                'transform-origin': '0% 0%',
                '-webkit-transform-origin': '0% 0%'
            })
            //.attr('contenteditable', 'true')
            .on('mousedown', function (evt) {
                evt.stopPropagation();
            })
            .on('mouseup', function (evt) {
                evt.stopPropagation();
            })
            .on('click', function (evt) {
                evt.stopPropagation();
            })
            .on('dblclick', function (evt) {
                evt.stopPropagation();
            })
            .on('keydown', function (evt) {
                evt.stopPropagation();
            })
            .on('keyup', function (evt) {
                evt.stopPropagation();
            })
            .appendTo(container);

        var Scribe = require('scribe');
        var scribe = new Scribe(this._inlineEditor[0]);


        scribe.setContent('<p>Hello, World!</p>');

        this._inlineEditor.focus();
    };

    /** @override */
    GXTextEditor.prototype.adjustInlineEditForView = function (view) {
        var sceneBBox = this.getElement().getGeometryBBox();
        if (!sceneBBox) {
            sceneBBox = GRect.fromPoints(new GPoint(-1, -1), new GPoint(1, 1));
            var transform = this.getElement().getTransform();
            if (transform) {
                sceneBBox = transform.mapRect(sceneBBox);
            }
        }

        var viewBBox = view.getWorldTransform().mapRect(sceneBBox);
        var left = viewBBox.getX();
        var top = viewBBox.getY();
        var minWidth = sceneBBox.getWidth() + 'px';
        var minHeight = sceneBBox.getHeight() + 'px';

        this._inlineEditor
            .css({
                'min-width': minWidth,
                'min-height': minHeight,
                'top': top,
                'left': left,
                'transform': 'scale(' + view.getZoom() + ')',
                '-webkit-transform': 'scale(' + view.getZoom() + ')'
            })
    };

    /** @override */
    GXTextEditor.prototype.finishInlineEdit = function () {
        this.getElement().setProperty('tx', this._inlineEditor.text());
        this._inlineEditor.remove();
        this._inlineEditor = null;

        this.setFlag(GXBlockEditor.Flag.ResizeAll);

        // TODO : I18N
        return 'Modify Text Content';
    };

    /** @override */
    GXTextEditor.prototype._prePaint = function (transform, context) {
        if ((this.hasFlag(GXElementEditor.Flag.Selected) || this.hasFlag(GXElementEditor.Flag.Highlighted)) && !this.isInlineEdit()) {
            // Paint textbox outline instead of glyphs
            var textRect = this._element.getGeometryBBox();
            if (textRect) {
                var transformedRect = transform.mapRect(textRect);

                // Ensure to pixel-align the rect
                var x = Math.floor(transformedRect.getX());
                var y = Math.floor(transformedRect.getY());
                var w = Math.ceil(transformedRect.getX() + transformedRect.getWidth()) - x;
                var h = Math.ceil(transformedRect.getY() + transformedRect.getHeight()) - y;

                if (this.hasFlag(GXElementEditor.Flag.Highlighted)) {
                    context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 2, context.highlightOutlineColor);
                } else {
                    context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1, context.selectionOutlineColor);
                }
            }
        }
    };

    /** @override */
    GXTextEditor.prototype.toString = function () {
        return "[Object GXTextEditor]";
    };

    _.GXTextEditor = GXTextEditor;
})(this);