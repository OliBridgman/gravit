(function() {
    function test(scene, page, view) {
        var wrapper = document.getElementById(EXApplication.Part.Windows.id);
        while (wrapper.hasChildNodes()) {
            wrapper.removeChild(wrapper.lastChild);
        }
    }

    gDevelopment.tests.push({
        title: 'Clean Everything',
        category: 'Path',
        test: test
    });
})();
