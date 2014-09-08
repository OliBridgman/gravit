(function (_) {

    /**
     * Converts a given image or url into a canvas
     * @param {String|Image|HTMLImageelement} imageOrUrl
     * @param {Function} done the callback function called when done with the
     * only parameter being the canvas with the painted image contents
     */
    _.image2Canvas = function (imageOrUrl, done) {
        if (typeof imageOrUrl === 'string' && imageOrUrl.substr(0, 5) !== 'data:') {
            var image = new Image();
            image.src = imageOrUrl;
            image.onload = function () {
                _.image2Canvas(image, done);
            }
        } else {
            var canvas = document.createElement("canvas");
            canvas.width = imageOrUrl.naturalWidth;
            canvas.height = imageOrUrl.naturalHeight;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(imageOrUrl, 0, 0);

            done(canvas);
        }
    };

    /**
     * Converts a given image or url into a base64-encoded png image data url (png)
     * @param {String|Image|HTMLImageelement} imageOrUrl
     * @param {Function} done the callback function called when done with the
     * only parameter being the data url string
     */
    _.image2Base64 = function (imageOrUrl, done) {
        _.image2Canvas(imageOrUrl, function (canvas) {
            done(canvas.toDataURL('image/png'));
        });
    };

    /**
     * Converts a given image or url into an array buffer (png)
     * @param {String|Image|HTMLImageelement} imageOrUrl
     * @param {Function} done the callback function called when done with the
     * only parameter being the ArrayBuffer
     */
    _.image2ArrayBuffer = function (imageOrUrl, done) {
        _.image2Canvas(imageOrUrl, function (canvas) {
            canvas.toBlob(function (blob) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    done(event.target.result);
                };
                reader.readAsArrayBuffer(blob);
            });
        });
    };

}(this));