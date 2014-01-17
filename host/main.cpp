#include <QApplication>
#include <QtGui>
#include <QtWebKit>
#include <QWebView>
#include "html5applicationviewer.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

   QWebView view;

#ifdef QT_DEBUG
   view.load(QUrl(QLatin1String("../src/index.html")));
#else

#endif
   view.show();
    return app.exec();
}
