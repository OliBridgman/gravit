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
   view.load(QUrl(QLatin1String("http://127.0.0.1:8999")));
#else
   view.load(QUrl(QLatin1String("index.html")));
#endif
   view.show();
    return app.exec();
}
