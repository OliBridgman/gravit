(function (_) {
    /**
     * GXEditorView is a widget to render and edit a scene
     * @param {GXEditor} [editor] the editor this view is bound too, defaults to null
     * @class GXEditorView
     * @extends GXSceneView
     * @constructor
     * @version 1.0
     */
    function GXEditorView(editor) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = null;
        GXSceneView.apply(this, args);

        if (editor) {
            this.setEditor(editor);
        }

        this._editorConfiguration = new GXEditorPaintConfiguration();

        // Add our editor layer
        this.addLayer(GXEditorView.Layer.Editor, this._editorConfiguration)
            .paint = this._paintEditorLayer.bind(this);

        // Add our grid layer
        this.addLayer(GXEditorView.Layer.Grid, null)
            .paint = this._paintGridLayer.bind(this);

        // Add our tool layer
        this.addLayer(GXEditorView.Layer.Tool, null);

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

    GObject.inherit(GXEditorView, GXSceneView);

    /**
     * Enumeration of known layers within an editor view.
     * @enum
     * @version 1.0
     */
    GXEditorView.Layer = {
        /**
         * The editor layer for painting editors
         * @type {Number}
         */
        Editor: 100,

        /**
         * The grid layer for painting grid(s)
         * @type {Number}
         */
        Grid: 101,

        /**
         * The tool layer for painting tools
         * @type {Number}
         */
        Tool: 103
    };

    /**
     * @type {GXEditorPaintConfiguration}
     * @private
     */
    GXEditorView.prototype._editorConfiguration = null;

    /**
     * @type {GXEditor}
     * @private
     */
    GXEditorView.prototype._editor = null;

    /**
     * Return the editor this view is rendering
     * @returns {GXEditor}
     */
    GXEditorView.prototype.getEditor = function () {
        return this._scene;
    };

    /**
     * Assign the editor this view is rendering
     * @param {GXEditor} editor
     */
    GXEditorView.prototype.setEditor = function (editor) {
        if (editor != this._editor) {
            if (this._editor) {
                this._editor.removeEventListener(GXEditor.InvalidationRequestEvent, this._editorInvalidationRequest);
            }

            this._editor = editor;

            if (this._editor) {
                this._editor.addEventListener(GXEditor.InvalidationRequestEvent, this._editorInvalidationRequest, this);
            }

            this.setScene(this._editor.getScene());
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {GXEditor.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GXEditorView.prototype._editorInvalidationRequest = function (event) {
        if (event.editor) {
            var area = event.editor.invalidate(this._worldToViewTransform, event.args);
            if (area) {
                this._layerMap[GXEditorView.Layer.Editor].invalidate(area);
            }
        }
    };

    /**
     * Paint the editor layer
     * @param {GXPaintContext} context
     * @private
     */
    GXEditorView.prototype._paintEditorLayer = function (context) {
        var sceneEditor = GXElementEditor.getEditor(this.getScene());
        if (sceneEditor) {
            sceneEditor.paint(this.getWorldTransform(), context);
        }
    };

    /**
     * Paint the grid layer
     * @param {GXPaintContext} context
     * @private
     */
    GXEditorView.prototype._paintGridLayer = function (context) {
        var cl = GXColor.parseCSSColor('rgba(255, 0, 0, 0.25)');
        var xStart = this._viewMargin[0];// + this._scrollX;
        var yStart = this._viewMargin[1];// + this._scrollY;
        for (var x  = xStart; x < this.getViewWidth(); x += 20) {
            context.canvas.fillRect(x, yStart, 1, this.getViewHeight(), cl);
        }
        for (var y  = yStart; y < this.getViewHeight(); y += 20) {
            context.canvas.fillRect(xStart, y, this.getViewWidth(), 1, cl);
        }
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