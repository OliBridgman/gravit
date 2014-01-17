(function (_) {

    /**
     * A raster image shape
     * @class GXImage
     * @extends GXShape
     * @constructor
     */
    function GXImage() {
        GXShape.call(this);
        this._setDefaultProperties(GXImage.VisualProperties);
        this._image = new Image();
        this._image.onload = this._updatedImage.bind(this);
        this._image.onerror = this._updatedImage.bind(this);
        this._image.onabort = this._updatedImage.bind(this);
        this._updateImage();
    }

    GXNode.inheritAndMix("image", GXImage, GXShape);

    /**
     * Visual properties of an image
     */
    GXImage.VisualProperties = {
        src: null
    };

    /**
     * @enum
     */
    GXImage.ImageStatus = {
        Loaded: 0,
        Loading: 1,
        Error: 2
    };

    /**
     * @type {Number}
     */
    GXImage.NO_IMAGE_WIDTH = 100;

    /**
     * @type {Number}
     */
    GXImage.NO_IMAGE_HEIGHT = 100;

    /**
     * @type {Number}
     */
    GXImage.NO_IMAGE_BACKGROUND = gColor.build(240, 240, 240, 255);

    /**
     * @type {Number}
     */
    GXImage.NO_IMAGE_ERROR_STROKE = gColor.build(255, 0, 0, 255);

    // -----------------------------------------------------------------------------------------------------------------
    // GXImage.StatusEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event called when the status of this image changes
     * @param {GXImage.ImageStatus} status the status
     * @class GXImage.StatusEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXImage.StatusEvent = function (status) {
        this.status = status;
    };
    GObject.inherit(GXImage.StatusEvent, GEvent);

    /**
     * The status
     * @type GXImage.ImageStatus
     */
    GXImage.StatusEvent.prototype.status = null;

    /** @override */
    GXImage.StatusEvent.prototype.toString = function () {
        return "[Event GXImage.StatusEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXImage Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {GXImage.ImageStatus}
     * @private
     */
    GXImage.prototype._status = null;

    /**
     * @type {Image}
     * @private
     */
    GXImage.prototype._image = null;

    /**
     * @type {number}
     * @private
     */
    GXImage.prototype._vertexIterator = 0;

    /** @override */
    GXImage.prototype.store = function (blob) {
        if (GXShape.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXImage.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXImage.prototype.restore = function (blob) {
        if (GXShape.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXImage.VisualProperties, true);
            this._updatedImage();
            return true;
        }
        return false;
    };

    /** @override */
    GXImage.prototype.rewindVertices = function (index) {
        this._vertexIterator = index;
        return true;
    };

    /** @override */
    GXImage.prototype.readVertex = function (vertex) {
        switch (this._vertexIterator) {
            case 0:
                vertex.command = GXVertex.Command.Move;
                vertex.x = 0;
                vertex.y = 0;
                break;
            case 1:
                vertex.command = GXVertex.Command.Line;
                vertex.x = this._getWidth();
                vertex.y = 0;
                break;
            case 2:
                vertex.command = GXVertex.Command.Line;
                vertex.x = this._getWidth();
                vertex.y = this._getHeight();
                break;
            case 3:
                vertex.command = GXVertex.Command.Line;
                vertex.x = 0;
                vertex.y = this._getHeight();
                break;
            case 4:
                vertex.command = GXVertex.Command.Close;
                break;
            default:
                return false;
        }

        this._vertexIterator += 1;

        return GXShape.prototype.readVertex.call(this, vertex);
    };

    /** @overide */
    GXImage.prototype._paintContents = function (context) {
        // We'll be painting our image before any other contents
        // but only, if we're not painting outline only!

        if (!context.configuration.isOutline(context)) {
            // Apply our transformation (if any) before the canvas transformation
            var canvasTransform = context.canvas.getTransform();
            if (this.$transform) {
                var tmpTransform = canvasTransform.preMultiplied(this.$transform);
                context.canvas.setTransform(tmpTransform);
            }

            // Paint depending on our status
            switch (this._status) {
                case GXImage.ImageStatus.Loaded:
                    context.canvas.drawImage(this._image);
                    break;

                case GXImage.ImageStatus.Loading:
                case GXImage.ImageStatus.Error:
                    var width = this._getWidth();
                    var height = this._getHeight();

                    context.canvas.fillRect(0, 0, width, height, GXImage.NO_IMAGE_BACKGROUND);

                    // TODO : Paint some loading indicator!?

                    if (this._status === GXImage.ImageStatus.Error) {
                        // Paint red cross
                        context.canvas.strokeLine(0, 0, width, height, 2, GXImage.NO_IMAGE_ERROR_STROKE);
                        context.canvas.strokeLine(width, 0, 0, height, 2, GXImage.NO_IMAGE_ERROR_STROKE);
                    }
                    break;

                default:
                    break;
            }

            // Reset original transform
            context.canvas.setTransform(canvasTransform);
        }

        GXShape.prototype._paintContents.call(this, context);
    };

    /** @override */
    GXImage.prototype._detailHitTest = function (location, transform) {
        // TODO : Make correct shape hit test here instead
        return new GXElement.HitResult(this);
    };

    /** @override */
    GXImage.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.AfterPropertiesChange) {
            if (args.properties.indexOf('src') >= 0) {
                this._updateImage();
            }
        }

        GXShape.prototype._handleChange.call(this, change, args);
    };

    /**
     * Return the actual width of the image shape
     * @returns {number}
     * @private
     */
    GXImage.prototype._getWidth = function () {
        if (this._image.naturalWidth) {
            return this._image.naturalWidth;
        } else {
            return GXImage.NO_IMAGE_WIDTH;
        }
    };

    /**
     * Return the actual height of the image shape
     * @returns {number}
     * @private
     */
    GXImage.prototype._getHeight = function () {
        if (this._image.naturalHeight) {
            return this._image.naturalHeight;
        } else {
            return GXImage.NO_IMAGE_HEIGHT;
        }
    };

    /**
     * Called to update the src of our image
     * @private
     */
    GXImage.prototype._updateImage = function () {
        this._setStatus(GXImage.ImageStatus.Loading);

        this._notifyChange(GXElement._Change.InvalidationRequest);
        this._notifyChange(GXElement._Change.PrepareGeometryUpdate);

        this._image.src = this.$src;
    };

    /**
     * Called from one of the listeners on our image
     * @private
     */
    GXImage.prototype._updatedImage = function () {
        this._notifyChange(GXElement._Change.FinishGeometryUpdate);

        if (this._image.naturalWidth !== 0 && this._image.naturalHeight !== 0) {
            this._setStatus(GXImage.ImageStatus.Loaded);
        } else {
            this._setStatus(GXImage.ImageStatus.Error);
        }
    };

    /**
     * @param {GXImage.ImageStatus} status
     * @private
     */
    GXImage.prototype._setStatus = function (status) {
        if (status !== this._status) {
            this._status = status;
            if (this.isAttached() && this._scene.hasEventListeners(GXImage.StatusEvent)) {
                this._scene.trigger(new GXImage.StatusEvent(this._status));
            }
        }
    };

    /** @override */
    GXImage.prototype.toString = function () {
        return "[GXImage]";
    };

    _.GXImage = GXImage;
})(this);