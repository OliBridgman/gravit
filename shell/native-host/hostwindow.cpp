#include "hostwindow.h"

#include <QtWidgets>
#include <QtWebKitWidgets>

HostWindow::HostWindow(QWidget *parent) :
    QMainWindow(parent),
    m_settings(new QSettings(this)),
    m_view(new QWebView(this)) {

    connect(this->m_view->page()->mainFrame(),
            SIGNAL(javaScriptWindowObjectCleared()), SLOT(addToJavaScript()));

#ifdef QT_DEBUG
    QString fileName = QFileDialog::getOpenFileName(this, "Open Index File", "", "Index File (*.html)");
    this->m_view->load(QUrl::fromLocalFile(fileName));
#else
    this->m_view->load(QUrl(QLatin1String("file:///Users/aadam/Documents/Customers/Gravit/git/gravit/build/index.html")));
#endif
}

void HostWindow::openShell() {
    QString state = this->m_settings->value("app.state").toString();
    if (state.isEmpty()) {
        // First run ever
        QRect screenGeometry = QApplication::desktop()->screenGeometry();
        this->resize(1024, 768);
        int x = (screenGeometry.width() - this->width()) / 2;
        int y = (screenGeometry.height() - this->height()) / 2;
        this->move(x, y);
        this->show();
    } else {
        this->resize(this->m_settings->value("app.size", QSize(1024, 768)).toSize());
        this->move(this->m_settings->value("app.pos", QPoint(0, 0)).toPoint());

        if (state.compare("maximized") == 0) {
            this->showMaximized();
        } else if (state.compare("fullscreen") == 0) {
            this->showFullScreen();
        } else {
            this->show();
        }
    }
}

QObject* HostWindow::addMenu(QObject* parent, const QString& title) {
    QMenu* menu = qobject_cast<QMenu*>(parent);
    if (menu) {
        return menu->addMenu(title);
    } else {
        return this->menuBar()->addMenu(title);
    }
}

QObject* HostWindow::addMenuItem(QObject* parent) {
    QMenu* menu = qobject_cast<QMenu*>(parent);
    if (menu) {
        return menu->addAction(QString(""));
    }
    return NULL;
}

void HostWindow::addMenuSeparator(QObject* parent) {
    QMenu* menu = qobject_cast<QMenu*>(parent);
    if (menu) {
        menu->addSeparator();
    }
}

void HostWindow::resizeEvent(QResizeEvent* event) {
    this->m_view->move(0, 0);
    this->m_view->resize(this->size());
    event->accept();
}

void HostWindow::closeEvent(QCloseEvent *event) {
    // TODO : Ask app for closing and if denied, ignore event and stop here
    event->accept();

    if (!this->isMaximized() && !this->isMinimized()) {
        this->m_settings->setValue("app.size", this->size());
        this->m_settings->setValue("app.pos", this->pos());
    }

    if (this->isMaximized()) {
        this->m_settings->setValue("app.state", "maximized");
    } else if (this->isFullScreen()) {
        this->m_settings->setValue("app.state", "fullscreen");
    } else {
        this->m_settings->setValue("app.state", "normal");
    }
}

void HostWindow::addToJavaScript()
{
    this->m_view->page()->mainFrame()->addToJavaScriptWindowObject("gshell", this);
}
