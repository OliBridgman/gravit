(function (_) {

    /**
     * A raster image shape
     * @class GImage
     * @extends GShape
     * @constructor
     */
    function GImage() {
        GShape.call(this);
        this._setDefaultProperties(GImage.VisualProperties);
        this._image = new Image();
        this._image.onload = this._updatedImage.bind(this);
        this._image.onerror = this._updatedImage.bind(this);
        this._image.onabort = this._updatedImage.bind(this);
        this._updateImage();
    }

    GNode.inheritAndMix("image", GImage, GShape);

    /**
     * Visual properties of an image
     */
    GImage.VisualProperties = {
        url: null
    };

    /**
     * @enum
     */
    GImage.ImageStatus = {
        Loaded: 0,
        Resolving: 1,
        Loading: 2,
        Delayed: 3,
        Error: 10
    };

    /**
     * @type {Number}
     */
    GImage.NO_IMAGE_WIDTH = 100;

    /**
     * @type {Number}
     */
    GImage.NO_IMAGE_HEIGHT = 100;

    /**
     * @type {Number}
     */
    GImage.NO_IMAGE_BACKGROUND = new GRGBColor([240, 240, 240]);

    /**
     * @type {Number}
     */
    GImage.NO_IMAGE_ERROR_STROKE = new GRGBColor([255, 0, 0]);

    // -----------------------------------------------------------------------------------------------------------------
    // GImage.StatusEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event called when the status of this image changes
     * @param {GImage} image the image
     * @param {GImage.ImageStatus} status the status
     * @class GImage.StatusEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GImage.StatusEvent = function (image, status) {
        this.image = image;
        this.status = status;
    };
    GObject.inherit(GImage.StatusEvent, GEvent);

    /**
     * The status
     * @type GImage
     */
    GImage.StatusEvent.prototype.image = null;

    /**
     * The status
     * @type GImage.ImageStatus
     */
    GImage.StatusEvent.prototype.status = null;

    /** @override */
    GImage.StatusEvent.prototype.toString = function () {
        return "[Event GImage.StatusEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GImage Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {GImage.ImageStatus}
     * @private
     */
    GImage.prototype._status = null;

    /**
     * @type {Image}
     * @private
     */
    GImage.prototype._image = null;

    /**
     * @type {number}
     * @private
     */
    GImage.prototype._vertexIterator = 0;

    /**
     * Returns the status of the image
     * @return {GImage.ImageStatus}
     */
    GImage.prototype.getStatus = function () {
        return this._status;
    };

    /**
     * Returns the underlying image
     * return {Image}
     */
    GImage.prototype.getImage = function () {
        return this._image;
    };

    /** @override */
    GImage.prototype.rewindVertices = function (index) {
        this._vertexIterator = index;
        return true;
    };

    /** @override */
    GImage.prototype.readVertex = function (vertex) {
        switch (this._vertexIterator) {
            case 0:
                vertex.command = GVertex.Command.Move;
                vertex.x = 0;
                vertex.y = 0;
                break;
            case 1:
                vertex.command = GVertex.Command.Line;
                vertex.x = this._getWidth();
                vertex.y = 0;
                break;
            case 2:
                vertex.command = GVertex.Command.Line;
                vertex.x = this._getWidth();
                vertex.y = this._getHeight();
                break;
            case 3:
                vertex.command = GVertex.Command.Line;
                vertex.x = 0;
                vertex.y = this._getHeight();
                break;
            case 4:
                vertex.command = GVertex.Command.Close;
                break;
            default:
                return false;
        }

        if (vertex.command !== GVertex.Command.Close && this.$trf) {
            this.$trf.map(vertex);
        }

        this._vertexIterator += 1;

        return true;
    };

    /** @override */
    GImage.prototype._detailHitTest = function (location, transform, tolerance, force) {
        // TODO : Make correct shape hit test here instead
        return new GElement.HitResultInfo(this);
    };

    /** @override */
    GImage.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GImage.VisualProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GImage.VisualProperties);
            this._updateImage();
        } else  if (change == GNode._Change.AfterPropertiesChange) {
            if (args.properties.indexOf('url') >= 0) {
                this._updateImage();
            }
        } else if (change === GNode._Change.Attached) {
            if (this._status === GImage.ImageStatus.Delayed) {
                this._updateImage();
            }
        }

        GShape.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GImage.prototype._paintFill = function (context) {
        GShape.prototype._paintFill.call(this, context);

        if (!context.configuration.isOutline(context)) {
            // Apply our transformation (if any) before the canvas transformation
            var canvasTransform = context.canvas.getTransform(true);
            if (this.$trf) {
                var tmpTransform = canvasTransform.preMultiplied(this.$trf);
                context.canvas.setTransform(tmpTransform);
            }

            // Paint depending on our status
            switch (this._status) {
                case GImage.ImageStatus.Loaded:
                    context.canvas.drawImage(this._image, 0, 0, false, 1);
                    break;

                default:
                    var width = this._getWidth();
                    var height = this._getHeight();

                    context.canvas.fillRect(0, 0, width, height, GImage.NO_IMAGE_BACKGROUND);

                    // TODO : Paint some loading indicator!?

                    if (this._status === GImage.ImageStatus.Error) {
                        // Paint red cross
                        context.canvas.strokeLine(0, 0, width, height, 2, GImage.NO_IMAGE_ERROR_STROKE);
                        context.canvas.strokeLine(width, 0, 0, height, 2, GImage.NO_IMAGE_ERROR_STROKE);
                    }
                    break;
            }

            // Reset original transform
            context.canvas.setTransform(canvasTransform);
        }
    };

    /**
     * Return the actual width of the image shape
     * @returns {number}
     * @private
     */
    GImage.prototype._getWidth = function () {
        if (this._image.naturalWidth) {
            return this._image.naturalWidth;
        } else {
            return GImage.NO_IMAGE_WIDTH;
        }
    };

    /**
     * Return the actual height of the image shape
     * @returns {number}
     * @private
     */
    GImage.prototype._getHeight = function () {
        if (this._image.naturalHeight) {
            return this._image.naturalHeight;
        } else {
            return GImage.NO_IMAGE_HEIGHT;
        }
    };

    /**
     * Called to update the url of our image
     * @private
     */
    GImage.prototype._updateImage = function () {
        if (!this.isAttached()) {
            this._setStatus(GImage.ImageStatus.Delayed);
        } else {
            this._setStatus(GImage.ImageStatus.Resolving);
            this._scene.resolveUrl(this.$url, this._resolvedImage.bind(this));
        }
    };
    /**
     * Called to load the image when an url is resolved
     * @private
     */
    GImage.prototype._resolvedImage = function (url) {
        this._setStatus(GImage.ImageStatus.Loading);

        this._notifyChange(GElement._Change.InvalidationRequest);
        this._notifyChange(GElement._Change.PrepareGeometryUpdate);

        this._image.src = url;
    };

    /**
     * Called from one of the listeners on our image
     * @private
     */
    GImage.prototype._updatedImage = function () {
        this._notifyChange(GElement._Change.FinishGeometryUpdate);

        if (this._image.naturalWidth !== 0 && this._image.naturalHeight !== 0) {
            this._setStatus(GImage.ImageStatus.Loaded);
        } else {
            this._setStatus(GImage.ImageStatus.Error);
        }
    };

    /**
     * @param {GImage.ImageStatus} status
     * @private
     */
    GImage.prototype._setStatus = function (status) {
        if (status !== this._status) {
            this._status = status;
            if (this._canEventBeSend(GImage.StatusEvent)) {
                this._scene.trigger(new GImage.StatusEvent(this, this._status));
            }
        }
    };

    /** @override */
    GImage.prototype.toString = function () {
        return "[GImage]";
    };

    _.GImage = GImage;
})(this);