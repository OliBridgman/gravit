(function (_) {
    /**
     * GXEditorView is a widget to render and edit a scene
     * @param {GXEditor} [editor] the editor this view is bound too, defaults to null
     * @class GXEditorView
     * @extends GXView
     * @constructor
     * @version 1.0
     */
    function GXEditorView(editor) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = editor.getScene();
        this._editor = editor;
        this._viewConfiguration = new GXEditorPaintConfiguration(); // !!overwrite

        GXView.apply(this, args);

        // Register drop events on our view
        $(this._htmlElement)
            .on('dragenter', function (evt) {
                var event = evt.originalEvent;
                event.preventDefault();
                event.stopPropagation();
            })
            .on('dragover', function (evt) {
                var event = evt.originalEvent;
                event.preventDefault();
                event.stopPropagation();
                evt.originalEvent.dataTransfer.dropEffect = 'move';
            })
            .on('drop', function (evt) {
                var event = evt.originalEvent;
                event.preventDefault();
                event.stopPropagation();
                var client = GUIWidget.convertClientPositionFromMousePosition(this._htmlElement, event);
                this._handleDrop(client, event.dataTransfer);
                return false;
            }.bind(this));
    }

    GObject.inherit(GXEditorView, GXView);

    /**
     * @type {GXEditor}
     * @private
     */
    GXEditorView.prototype._editor = null;

    /**
     * @type {GXToolLayer}
     * @private
     */
    GXEditorView.prototype._toolLayer = null;

    /**
     * Return the editor this view is rendering
     * @returns {GXEditor}
     */
    GXEditorView.prototype.getEditor = function () {
        return this._editor;
    };

    /**
     * Return the editor's tool layer
     * @returns {GXToolLayer}
     */
    GXEditorView.prototype.getToolLayer = function () {
        return this._toolLayer;
    };

    /** @override */
    GXEditorView.prototype._initLayers = function () {
        this._addLayer(new GXSceneLayer(this));
        this._addLayer(new GXGridLayer(this));
        this._addLayer(new GXEditorLayer(this));
        this._toolLayer = this._addLayer(new GXToolLayer(this));
    };

    /**
     * Handle a drop on the editor
     * @param {GPoint} position screen coordinates position
     * @param {DataTransfer} dataTransfer the dataTransfer object
     * @private
     */
    GXEditorView.prototype._handleDrop = function (position, dataTransfer) {
        // Convert position into scene coordinates
        var scenePosition = this.getViewTransform().mapPoint(position);

        // First we'll check for a file-drop
        if (dataTransfer.files && dataTransfer.files.length > 0) {
            var imageType = /image.*/;

            for (var i = 0; i < dataTransfer.files.length; ++i) {
                var file = dataTransfer.files[i];

                // Check for image files
                if (file.type.match(imageType)) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        var image = new GXImage();
                        image.setProperties(['src'], [event.target.result]);
                        image.transform(new GTransform(1, 0, 0, 1, scenePosition.getX(), scenePosition.getY()));
                        this._editor.insertElements([image]);
                    }.bind(this)
                    reader.readAsDataURL(file);
                }

                // TODO : Check for infinity files and other types?
            }
        } else if (dataTransfer.items && dataTransfer.items.length > 0) {
            // Iterate items and find an appropriate drag type
            for (var i = 0; i < dataTransfer.items.length; ++i) {
                var item = dataTransfer.items[i];
                var type = null;
                var source = null;

                if (item.type === GXColor.MIME_TYPE) {
                    type = GXElementEditor.DropType.Color;
                    source = dataTransfer.getData(GXColor.MIME_TYPE);
                    source = source && source !== "" ? GXColor.parseColor(source) : null;
                } else if (item.type === GXNode.MIME_TYPE) {
                    type = GXElementEditor.DropType.Node;
                    source = dataTransfer.getData(GXNode.MIME_TYPE);
                    source = source && source !== "" ? GXNode.deserialize(source) : null;
                } else if (item.type === 'text/plain') {
                    type = GXElementEditor.DropType.Text;
                    source = dataTransfer.getData('text/plain');
                }

                // If we've extracted a type, then try to let an editor handle it now
                if (type !== null) {
                    // Try to gather a stacked hit list underneath drop position
                    var stackedHits = this._scene.hitTest(position, this.getWorldTransform(), null, true, -1, this._scene.getProperty('pickDist'), true);

                    // If we had have one or more hits, iterate them
                    var acceptedDrop = false;
                    if (stackedHits && stackedHits.length > 0) {
                        for (var i = 0; i < stackedHits.length; ++i) {
                            var hit = stackedHits[i];
                            // Create a temporary editor for the hit element which gets not attached
                            var editor = GXElementEditor.createEditor(hit.element);
                            if (editor && editor.acceptDrop(scenePosition, type, source, hit.data)) {
                                // Drop was accepted so we're done here
                                acceptedDrop = true;
                                break;
                            }
                        }
                    }

                    // If drop was not yet accepted, try to do some custom handling here depending on type
                    if (!acceptedDrop) {
                        if (type === GXElementEditor.DropType.Node && source instanceof GXElement) {
                            // Move the element to the drop-position
                            var elBBox = source.getGeometryBBox();
                            source.transform(new GTransform(1, 0, 0, 1,
                                scenePosition.getX() - (elBBox ? elBBox.getX() : 0), scenePosition.getY() - (elBBox ? elBBox.getY() : 0)))

                            // Insert element and select it
                            this._editor.insertElements([source]);
                            acceptedDrop = true;
                        }
                    }
                }
            }
        }
    };

    /** @override */
    GXEditorView.prototype.toString = function () {
        return "[Object GXEditorView]";
    };

    _.GXEditorView = GXEditorView;

})(this);