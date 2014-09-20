(function (_) {

    /**
     * A raster image shape
     * @class IFImage
     * @extends IFShape
     * @constructor
     */
    function IFImage() {
        IFShape.call(this);
        this._setDefaultProperties(IFImage.VisualProperties);
        this._image = new Image();
        this._image.onload = this._updatedImage.bind(this);
        this._image.onerror = this._updatedImage.bind(this);
        this._image.onabort = this._updatedImage.bind(this);
        this._updateImage();
    }

    IFNode.inheritAndMix("image", IFImage, IFShape);

    /**
     * Visual properties of an image
     */
    IFImage.VisualProperties = {
        url: null
    };

    /**
     * @enum
     */
    IFImage.ImageStatus = {
        Loaded: 0,
        Resolving: 1,
        Loading: 2,
        Delayed: 3,
        Error: 10
    };

    /**
     * @type {Number}
     */
    IFImage.NO_IMAGE_WIDTH = 100;

    /**
     * @type {Number}
     */
    IFImage.NO_IMAGE_HEIGHT = 100;

    /**
     * @type {Number}
     */
    IFImage.NO_IMAGE_BACKGROUND = new IFColor(IFColor.Type.RGB, [240, 240, 240, 100]);

    /**
     * @type {Number}
     */
    IFImage.NO_IMAGE_ERROR_STROKE = new IFColor(IFColor.Type.RGB, [255, 0, 0, 100]);

    // -----------------------------------------------------------------------------------------------------------------
    // IFImage.StatusEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event called when the status of this image changes
     * @param {IFImage} image the image
     * @param {IFImage.ImageStatus} status the status
     * @class IFImage.StatusEvent
     * @extends IFEvent
     * @constructor
     * @version 1.0
     */
    IFImage.StatusEvent = function (image, status) {
        this.image = image;
        this.status = status;
    };
    IFObject.inherit(IFImage.StatusEvent, IFEvent);

    /**
     * The status
     * @type IFImage
     */
    IFImage.StatusEvent.prototype.image = null;

    /**
     * The status
     * @type IFImage.ImageStatus
     */
    IFImage.StatusEvent.prototype.status = null;

    /** @override */
    IFImage.StatusEvent.prototype.toString = function () {
        return "[Event IFImage.StatusEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFImage Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {IFImage.ImageStatus}
     * @private
     */
    IFImage.prototype._status = null;

    /**
     * @type {Image}
     * @private
     */
    IFImage.prototype._image = null;

    /**
     * @type {number}
     * @private
     */
    IFImage.prototype._vertexIterator = 0;

    /**
     * Returns the status of the image
     * @return {IFImage.ImageStatus}
     */
    IFImage.prototype.getStatus = function () {
        return this._status;
    };

    /**
     * Returns the underlying image
     * return {Image}
     */
    IFImage.prototype.getImage = function () {
        return this._image;
    };

    /** @override */
    IFImage.prototype.rewindVertices = function (index) {
        this._vertexIterator = index;
        return true;
    };

    /** @override */
    IFImage.prototype.readVertex = function (vertex) {
        switch (this._vertexIterator) {
            case 0:
                vertex.command = IFVertex.Command.Move;
                vertex.x = 0;
                vertex.y = 0;
                break;
            case 1:
                vertex.command = IFVertex.Command.Line;
                vertex.x = this._getWidth();
                vertex.y = 0;
                break;
            case 2:
                vertex.command = IFVertex.Command.Line;
                vertex.x = this._getWidth();
                vertex.y = this._getHeight();
                break;
            case 3:
                vertex.command = IFVertex.Command.Line;
                vertex.x = 0;
                vertex.y = this._getHeight();
                break;
            case 4:
                vertex.command = IFVertex.Command.Close;
                break;
            default:
                return false;
        }

        if (vertex.command !== IFVertex.Command.Close && this.$trf) {
            this.$trf.map(vertex);
        }

        this._vertexIterator += 1;

        return true;
    };

    /** @override */
    IFImage.prototype._detailHitTest = function (location, transform, tolerance, force) {
        // TODO : Make correct shape hit test here instead
        return new IFElement.HitResultInfo(this);
    };

    /** @override */
    IFImage.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFImage.VisualProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFImage.VisualProperties);
            this._updateImage();
        } else  if (change == IFNode._Change.AfterPropertiesChange) {
            if (args.properties.indexOf('url') >= 0) {
                this._updateImage();
            }
        } else if (change === IFNode._Change.Attached) {
            if (this._status === IFImage.ImageStatus.Delayed) {
                this._updateImage();
            }
        }

        IFShape.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFImage.prototype._paintStyleLayer = function (context, layer) {
        IFShape.prototype._paintStyleLayer.call(this, context, layer);

        if (layer === IFElement.Stylable.PaintLayer.Background && !context.configuration.isOutline(context)) {
            // Apply our transformation (if any) before the canvas transformation
            var canvasTransform = context.canvas.getTransform(true);
            if (this.$trf) {
                var tmpTransform = canvasTransform.preMultiplied(this.$trf);
                context.canvas.setTransform(tmpTransform);
            }

            // Paint depending on our status
            switch (this._status) {
                case IFImage.ImageStatus.Loaded:
                    context.canvas.drawImage(this._image, 0, 0, false, 1);
                    break;

                default:
                    var width = this._getWidth();
                    var height = this._getHeight();

                    context.canvas.fillRect(0, 0, width, height, IFImage.NO_IMAGE_BACKGROUND);

                    // TODO : Paint some loading indicator!?

                    if (this._status === IFImage.ImageStatus.Error) {
                        // Paint red cross
                        context.canvas.strokeLine(0, 0, width, height, 2, IFImage.NO_IMAGE_ERROR_STROKE);
                        context.canvas.strokeLine(width, 0, 0, height, 2, IFImage.NO_IMAGE_ERROR_STROKE);
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
    IFImage.prototype._getWidth = function () {
        if (this._image.naturalWidth) {
            return this._image.naturalWidth;
        } else {
            return IFImage.NO_IMAGE_WIDTH;
        }
    };

    /**
     * Return the actual height of the image shape
     * @returns {number}
     * @private
     */
    IFImage.prototype._getHeight = function () {
        if (this._image.naturalHeight) {
            return this._image.naturalHeight;
        } else {
            return IFImage.NO_IMAGE_HEIGHT;
        }
    };

    /**
     * Called to update the url of our image
     * @private
     */
    IFImage.prototype._updateImage = function () {
        if (!this.isAttached()) {
            this._setStatus(IFImage.ImageStatus.Delayed);
        } else {
            this._setStatus(IFImage.ImageStatus.Resolving);
            this._scene.resolveUrl(this.$url, this._resolvedImage.bind(this));
        }
    };
    /**
     * Called to load the image when an url is resolved
     * @private
     */
    IFImage.prototype._resolvedImage = function (url) {
        this._setStatus(IFImage.ImageStatus.Loading);

        this._notifyChange(IFElement._Change.InvalidationRequest);
        this._notifyChange(IFElement._Change.PrepareGeometryUpdate);

        this._image.src = url;
    };

    /**
     * Called from one of the listeners on our image
     * @private
     */
    IFImage.prototype._updatedImage = function () {
        this._notifyChange(IFElement._Change.FinishGeometryUpdate);

        if (this._image.naturalWidth !== 0 && this._image.naturalHeight !== 0) {
            this._setStatus(IFImage.ImageStatus.Loaded);
        } else {
            this._setStatus(IFImage.ImageStatus.Error);
        }
    };

    /**
     * @param {IFImage.ImageStatus} status
     * @private
     */
    IFImage.prototype._setStatus = function (status) {
        if (status !== this._status) {
            this._status = status;
            if (this.isAttached() && this._scene.hasEventListeners(IFImage.StatusEvent)) {
                this._scene.trigger(new IFImage.StatusEvent(this, this._status));
            }
        }
    };

    /** @override */
    IFImage.prototype.toString = function () {
        return "[IFImage]";
    };

    _.IFImage = IFImage;
})(this);