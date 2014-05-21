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

    var _firefox = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GXTextEditor.prototype._inlineEditor = null;

    /**
     * @type {Scribe}
     * @private
     */
    GXTextEditor.prototype._inlineEditor = null;

    GXTextEditor.prototype.getParagraphProperty = function (property) {
        // TODO
    };

    GXTextEditor.prototype.setParagraphProperty = function (property, value) {
        this.setParagraphProperties([property], [value]);
    };

    GXTextEditor.prototype.setParagraphProperties = function (properties, values) {

        // TODO
        // Inline-Editor=False -> Apply as property to getContent()
        // Inline-Editor=True -> convert property|value to css, apply to selection range's paragraph

        this.getElement().getContent().setProperties(properties, values);
    };

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
        // Remove size handles and hide our text element
        this.removeFlag(GXBlockEditor.Flag.ResizeAll);
        this.getElement().setFlag(GXElement.Flag.NoPaint);

        var html = this.getElement().asHtml();

        this._inlineEditor = $($('<div></div>'))
            .css(this.getElement().getContent().propertiesToCss({}))
            .css({
                'position': 'absolute',
                'background': 'transparent',
                'transform-origin': '0% 0%',
                '-webkit-transform-origin': '0% 0%',
                'min-width': '1em',
                'min-height': '1em'
            })
            .attr('contenteditable', 'true')
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
            .html(html)
            .appendTo(container);

        this._inlineEditor.focus();

        // Insert paragraph for empty content(s) on firefox
        if (html === "" && _firefox) {
            document.execCommand("InsertParagraph", false, 'test');
        }
    };

    /** @override */
    GXTextEditor.prototype.adjustInlineEditForView = function (view) {
        var sceneBBox = this.getElement().getGeometryBBox();
        if (!sceneBBox) {
            sceneBBox = GRect.fromPoints(new GPoint(0, 0), new GPoint(1, 1));
            var transform = this.getElement().getTransform();
            if (transform) {
                sceneBBox = transform.mapRect(sceneBBox);
            }
        }

        var viewBBox = view.getWorldTransform().mapRect(sceneBBox);
        var left = viewBBox.getX();
        var top = viewBBox.getY();
        var minWidth = sceneBBox.getWidth() <= 0 ? '1em' : sceneBBox.getWidth() + 'px';
        var minHeight = sceneBBox.getHeight() <= 0 ? '1em' : sceneBBox.getHeight() + 'px';

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
        var html = this._inlineEditor.html();

        if (_firefox) {
            html = html.replace(/<br><\/p>$/, '</p>');
        }

        this.getElement().fromHtml(html);
        this._inlineEditor.remove();
        this._inlineEditor = null;

        // Show size handles and our text element
        this.setFlag(GXBlockEditor.Flag.ResizeAll);
        this.getElement().removeFlag(GXElement.Flag.NoPaint);

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