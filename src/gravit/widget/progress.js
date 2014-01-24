(function (_) {

    /**
     * A progress panel
     * @param {XMLHttpRequest} [request] optional http request to bind to
     * @param {String} [requestContentLengthHeader] optional http header for
     * request to read the content-length from if not given (i.e. for compressed files)
     * @class GUIProgress
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GUIProgress(request, requestContentLengthHeader) {
        this._htmlElement = $('<div></div>')
            .addClass('g-progress')
            .append($('<div></div>')
                .addClass('g-progress-title'))
            .append($('<div></div>')
                .addClass('g-progress-icon')
                .append($('<i></i>')))
            .append($('<div></div>')
                .addClass('g-progress-bar')
                .append($('<div></div>')
                    .addClass('g-progress-slider')
                    .html('&nbsp;')));

        this.setMode(GUIProgress.Mode.Wait);
        this.setProgress(0);

        if (request) {
            var contentLength = null;

            var requestProgressListener = function (evt) {
                var total = evt.lengthComputable ? evt.total : null;

                if (!total && contentLength) {
                    total = contentLength;
                }

                if (evt.loaded && total) {
                    this.setProgress(evt.loaded / total);
                }
            }.bind(this);

            request.upload.addEventListener("progress", requestProgressListener, false);
            request.addEventListener("progress", requestProgressListener, false);

            request.addEventListener("readystatechange", function () {
                switch (request.readyState) {
                    case 0:
                        this.setMode(GUIProgress.Mode.Wait);
                        break;
                    case 1:
                        this.setMode(GUIProgress.Mode.Process);
                        break;
                    case 2:
                    case 3:
                        if (requestContentLengthHeader && !contentLength) {
                            try {
                                var len = request.getResponseHeader(requestContentLengthHeader);
                                if (len) {
                                    contentLength = parseInt(len);
                                }
                            } catch (e) {
                            }
                        }
                        break;
                    case 4:
                        // TODO : Better handling of error status codes ??
                        this.setMode(request.status >= 200 && request.status < 300 ?
                            GUIProgress.Mode.Success : GUIProgress.Mode.Failure);
                        break;
                }
            }.bind(this), false);
        }
    };

    GObject.inherit(GUIProgress, GEventTarget);

    /**
     * @enum
     */
    GUIProgress.Mode = {
        Wait: 0,
        Process: 1,
        Failure: 2,
        Success: 3,
        Finished: 4
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIProgress.UpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event fired whenever the mode or progress changed
     * @class GUIProgress.UpdateEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIProgress.UpdateEvent = function () {
    };
    GObject.inherit(GUIProgress.UpdateEvent, GEvent);

    /** @override */
    GUIProgress.UpdateEvent.prototype.toString = function () {
        return "[Object GUIProgress.UpdateEvent]";
    };

    GUIProgress.UPDATE_EVENT = new GUIProgress.UpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIProgress Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {JQuery}
     * @private
     */
    GUIProgress.prototype._htmlElement = null;

    /**
     * @type {GUIProgress.Mode}
     * @private
     */
    GUIProgress.prototype._mode = null;

    /**
     * @type {GLocale.Key|String}
     * @private
     */
    GUIProgress.prototype._title = null;

    /**
     * @type {GLocale.Key|String}
     * @private
     */
    GUIProgress.prototype._message = null;

    /**
     * @type {Number}
     * @private
     */
    GUIProgress.prototype._progress = null;

    /**
     * Return the current mode
     * @returns {GUIProgress.Mode}
     */
    GUIProgress.prototype.getMode = function () {
        return this._mode;
    };

    /**
     * Assign the current mode
     * @param {GUIProgress.Mode} mode the new mode
     */
    GUIProgress.prototype.setMode = function (mode) {
        if (mode !== this._mode) {
            this._mode = mode;

            switch (this._mode) {
                case GUIProgress.Mode.Wait:
                    this._htmlElement.attr('class', 'g-progress g-progress-wait');
                    this._htmlElement.find('.g-progress-icon > i')
                        .attr('class', 'fa fa-download');
                    break;
                case GUIProgress.Mode.Process:
                    this._htmlElement.attr('class', 'g-progress g-progress-process');
                    this._htmlElement.find('.g-progress-icon > i')
                        .attr('class', 'fa fa-spinner fa-spin');
                    this.setProgress(0);
                    break;
                case GUIProgress.Mode.Failure:
                    this._htmlElement.attr('class', 'g-progress g-progress-failure');
                    this._htmlElement.find('.g-progress-icon > i')
                        .attr('class', 'fa fa-warning');
                    break;
                case GUIProgress.Mode.Success:
                case GUIProgress.Mode.Finished:
                    this._htmlElement.attr('class', 'g-progress g-progress-success');
                    this._htmlElement.find('.g-progress-icon > i')
                        .attr('class', 'fa fa-check');
                    break;
            }

            this._updateMessage();

            if (this.hasEventListeners(GUIProgress.UpdateEvent)) {
                this.trigger(GUIProgress.UPDATE_EVENT);
            }
        }
    };

    /**
     * Get the title of the progress
     * @return {GLocale.Key|String}
     * @version 1.0
     */
    GUIProgress.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * Assign a title for the progress
     * @param {GLocale.Key|String} title
     * @version 1.0
     */
    GUIProgress.prototype.setTitle = function (title) {
        if (title !== this._title) {
            this._title = title;
            this._htmlElement.find('.g-progress-title').text(gLocale.get(title));
        }
    };

    /**
     * Get the message of the progress, may be null for none
     * @return {GLocale.Key|String}
     * @version 1.0
     */
    GUIProgress.prototype.getMessage = function () {
        return this._message;
    };

    /**
     * Assign a title for the progress, maybe null for none
     * @param {GLocale.Key|String} message
     * @version 1.0
     */
    GUIProgress.prototype.setMessage = function (message) {
        if (message !== this._message) {
            this._message = message;
            this._updateMessage();
        }
    };

    /**
     * Get the progress in range of 0..1
     * @return {Number}
     * @version 1.0
     */
    GUIProgress.prototype.getProgress = function () {
        return this._progress;
    };

    /**
     * Assign the progress if range of 0..1
     * @param {Number} progress
     * @version 1.0
     */
    GUIProgress.prototype.setProgress = function (progress) {
        if (progress !== this._progress) {
            if (!progress || progress < 0) {
                progress = 0;
            } else if (progress > 1.0) {
                progress = 1.0;
            }

            this._progress = progress;
            this._htmlElement.find('.g-progress-slider').css('width', (progress * 100).toString() + '%');

            this._updateMessage();

            if (this.hasEventListeners(GUIProgress.UpdateEvent)) {
                this.trigger(GUIProgress.UPDATE_EVENT);
            }
        }
    };

    GUIProgress.prototype._updateMessage = function () {
        var messageString = this._message ? gLocale.get(this._message) : "&nbsp;";

        switch (this._mode) {
            case GUIProgress.Mode.Wait:
                if (!this._message) {
                    messageString = gLocale.get(GLocale.Constant.Waiting) + ' ...';
                }
                break;
            case GUIProgress.Mode.Process:
                messageString = (this._progress * 100).toFixed(0) + '%';
                break;
            case GUIProgress.Mode.Failure:
                if (!this._message) {
                    messageString = gLocale.get(GLocale.Constant.Failure);
                }
                break;
            case GUIProgress.Mode.Success:
            case GUIProgress.Mode.Finished:
                if (!this._message) {
                    messageString = gLocale.get(GLocale.Constant.Success);
                }
                break;
        }

        this._htmlElement.find('.g-progress-slider').html(messageString);
    };

    _.GUIProgress = GUIProgress;
})(this);