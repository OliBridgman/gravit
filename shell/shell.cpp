#include <QApplication>

#include "shellwindow.h"

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    app.setApplicationName("Gravit");
    app.setOrganizationName("Gravit");
    app.setOrganizationDomain("gravit.io");

    ShellWindow window;
    window.setWindowTitle(app.applicationName());

    return app.exec();
}
