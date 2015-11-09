(function (_) {

    /**
     * Image properties panel
     * @class GImageProperties
     * @extends GProperties
     * @constructor
     */
    function GImageProperties() {
    };
    GObject.inherit(GImageProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GImageProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GImageProperties.prototype._document = null;

    /**
     * @type {GImage}
     * @private
     */
    GImageProperties.prototype._image = null;

    /** @override */
    GImageProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        panel
            .css('width', '210px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                .append($('<span></span>')
                    .addClass('fa fa-image'))
                .append($('<span></span>')
                    .css({
                        'text-overflow': 'ellipsis',
                        'padding-left': '5px'
                    })
                    .attr('data-property', 'url')))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .append($('<button></button>')
                    .attr('data-action', 'embed')
                    // TODO : I18N
                    .text('Embed')
                    .on('click', function () {
                        image2Base64(this._image.getImage(), function (data) {
                            // TODO : I18N
                            GEditor.tryRunTransaction(this._image, function () {
                                this._image.setProperty('url', data);
                            }.bind(this), 'Embed Image');
                        }.bind(this));
                    }.bind(this)))
                .append($('<button></button>')
                    .attr('data-action', 'link')
                    // TODO : I18N
                    .text('Link')
                    .on('click', function () {
                        var topLeft = this._image.getGeometryBBox().getSide(GRect.Side.TOP_LEFT);
                        this._document.getStorage().openResourcePrompt(this._document.getUrl(), ['jpg', 'jpeg', 'png', 'gif'], function (url) {
                            // TODO : I18N
                            GEditor.tryRunTransaction(this._image, function () {
                                // make url relative to document & reset size
                                this._image.setProperties(['url', 'trf'], [new URI(url).relativeTo(this._document.getUrl()).toString(), new GTransform(1, 0, 0, 1, topLeft.getX(), topLeft.getY())]);
                            }.bind(this), 'Replace Image');
                        }.bind(this));
                    }.bind(this)))
                .append($('<button></button>')
                    .attr('data-action', 'export')
                    // TODO : I18N
                    .text('Export')
                    .on('click', function () {
                        var storage = gApp.getMatchingStorage(true, true, 'png', false, this._document.getStorage());
                        if (storage) {
                            storage.saveResourcePrompt(this._document.getUrl(), this._image.getLabel(), ['png'], function (url) {
                                image2ArrayBuffer(this._image.getImage(), function (buffer) {
                                    storage.save(url, buffer, true);
                                });
                            }.bind(this));
                        }
                    }.bind(this)))
                .append($('<button></button>')
                    .attr('data-action', 'reset-size')
                    // TODO : I18N
                    .text('Reset Size')
                    .on('click', function () {
                        var topLeft = this._image.getGeometryBBox().getSide(GRect.Side.TOP_LEFT);
                        // TODO : I18N
                        GEditor.tryRunTransaction(this._image, function () {
                            this._image.setProperty('trf', new GTransform(1, 0, 0, 1, topLeft.getX(), topLeft.getY()));
                        }.bind(this), 'Reset Size');
                    }.bind(this))))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }))
            .append($('<button></button>')
                .attr('data-image-palette', 'button')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Get Image Palette')
                .on('click', this._updateImagePalette.bind(this)))
            .append($('<div></div>')
                .attr('data-image-palette', 'palette')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '5px',
                    'right': '5px',
                    'height': '27px'
                }));
    };

    GImageProperties.prototype._updateImagePalette = function () {
        var image = this._image.getImage();

        var palettePanel = this._panel.find('[data-image-palette="palette"]');
        palettePanel.empty();

        var _addPaletteColor = function (color) {
            $('<div></div>')
                .gPatternTarget({
                    allowDrop: false
                })
                .gPatternTarget('types', [GColor])
                .gPatternTarget('value', color)
                .css({
                    'display': 'inline-block',
                    'height': '100%',
                    'width': '12.5%',
                    'background': GPattern.asCSSBackground(color)
                })
                .appendTo(palettePanel);
        }.bind(this);

        if (image) {
            palettePanel.css('display', '');
            this._panel.find('[data-image-palette="button"]').css('display', 'none');

            var colorThief = new ColorThief();
            var mainColor = new GRGBColor(colorThief.getColor(image));
            _addPaletteColor(mainColor);

            var palette = colorThief.getPalette(image, 16);
            var addedColors = 1;
            for (var i = 0; i < palette.length; ++i) {
                var convertedColor = new GRGBColor(palette[i]);

                // Take care to avoid duplications with dominant color
                if (!GUtil.equals(convertedColor, mainColor)) {
                    _addPaletteColor(convertedColor);

                    if (++addedColors >= 8) {
                        break;
                    }
                }
            }
        }
    };

    /** @override */
    GImageProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getScene().removeEventListener(GImage.StatusEvent, this._imageStatus, this);
            this._document = null;
        }

        this._image = null;

        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof GImage) {
                if (this._image) {
                    // We'll work on a single image, only
                    this._image = null;
                    break;
                } else {
                    this._image = elements[i];
                }
            }
        }

        if (this._image) {
            this._document = document;
            this._document.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getScene().addEventListener(GImage.StatusEvent, this._imageStatus, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GImageProperties.prototype._afterPropertiesChange = function (event) {
        if (this._image && this._image === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @param {GImage.StatusEvent} event
     * @private
     */
    GImageProperties.prototype._imageStatus = function (event) {
        if (event.image === this._image && (event.status === GImage.ImageStatus.Error || event.status === GImage.ImageStatus.Loaded)) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GImageProperties.prototype._updateProperties = function () {
        var url = this._image.getProperty('url');
        var isData = url.indexOf('data:') === 0;
        var status = this._image.getStatus();
        var image = this._image.getImage();
        var hasImage = image && status === GImage.ImageStatus.Loaded;
        var imgBBox = this._image.getGeometryBBox();

        // TODO : I18N
        this._panel.find('[data-property="url"]').text(isData ? '<Embedded Image>' : decodeURIComponent(url));
        this._panel.find('button[data-action="embed"]').prop('disabled', !hasImage || isData);
        this._panel.find('button[data-action="link"]').prop('disabled', !this._document.isSaveable());
        this._panel.find('button[data-action="export"]').prop('disabled', !hasImage || !this._document.isSaveable());
        this._panel.find('button[data-action="reset-size"]').prop('disabled', !hasImage || (image.naturalWidth === imgBBox.getWidth() && image.naturalHeight === imgBBox.getHeight()));

        this._panel.find('[data-image-palette="button"]')
            .prop('disabled', !hasImage)
            .css('display', '');

        this._panel.find('[data-image-palette="palette"]').css('display', 'none');
    };

    /** @override */
    GImageProperties.prototype.toString = function () {
        return "[Object GImageProperties]";
    };

    _.GImageProperties = GImageProperties;
})(this);