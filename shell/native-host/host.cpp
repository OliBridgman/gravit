#include <QApplication>

#include "hostwindow.h"

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    app.setApplicationName("Gravit");
    app.setOrganizationName("Gravit");
    app.setOrganizationDomain("gravit.io");

    HostWindow window;
    window.setWindowTitle(app.applicationName());

    return app.exec();
}
