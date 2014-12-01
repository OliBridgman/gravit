(function () {
    gDevelopment.tests.push({
        title: 'Create Multiple Pages',
        test: function () {
            var page = new GPage(gApp.getActiveProject());
            page.setProperties(['w', 'h'], [1000, 800]);
            gApp.addDocument(page, 'Test-Page');
        }
    });
})();
