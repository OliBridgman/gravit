(function ($) {

    /**
     * Selector that selects all editable elements including all input
     * elements and also content editable elements and the such
     * @param obj
     * @returns {boolean}
     */
    $.expr[':'].editable = function(obj){
        var $this = $(obj);
        return $this.is(':input') || $this.attr('contenteditable') === 'true' || obj.isContentEditable;
    };

    /**
     * Register ajax transports for blob send/recieve and array buffer send/receive via XMLHttpRequest Level 2
     * within the comfortable framework of the jquery ajax request, with full support for promises.
     *
     * Notice the +* in the dataType string? The + indicates we want this transport to be prepended to the list
     * of potential transports (so it gets first dibs if the request passes the conditions within to provide the
     * ajax transport, preventing the standard transport from hogging the request), and the * indicates that
     * potentially any request with any dataType might want to use the transports provided herein.
     *
     * Remember to specify 'processData:false' in the ajax options when attempting to send a blob or arraybuffer -
     * otherwise jquery will try (and fail) to convert the blob or buffer into a query string.
     */
    $.ajaxTransport("+*", function(options, originalOptions, jqXHR){
        // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
        // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
        // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
        if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer'))
            || (options.data && ((window.Blob && options.data instanceof Blob)
            || (window.ArrayBuffer && options.data instanceof ArrayBuffer)))
            ))
        {
            return {
                /**
                 * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
                 * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
                 * into the jquery complete callback (such as the success function, done blocks, etc.)
                 *
                 * @param headers
                 * @param completeCallback
                 */
                send: function(headers, completeCallback){
                    var xhr = new XMLHttpRequest(),
                        url = options.url || window.location.href,
                        type = options.type || 'GET',
                        dataType = options.dataType || 'text',
                        data = options.data || null,
                        async = options.async || true;

                    xhr.addEventListener('load', function(){
                        var res = {};

                        res[dataType] = xhr.response;
                        completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders());
                    });

                    xhr.open(type, url, async);
                    xhr.responseType = dataType;
                    xhr.send(data);
                },
                abort: function(){
                    jqXHR.abort();
                }
            };
        }
    });

}(jQuery));