#ifndef SHELLWINDOW_H
#define SHELLWINDOW_H

#include <QMainWindow>
class QSettings;
class QWebView;

class ShellWindow : public QMainWindow
{
    Q_OBJECT
public:
    explicit ShellWindow(QWidget *parent = 0);

// Shell Interface
public:
    Q_INVOKABLE void openShell();

    Q_INVOKABLE QObject* addMenu(QObject* parent, const QString& title);
    Q_INVOKABLE QObject* addMenuItem(QObject* parent);
    Q_INVOKABLE void addMenuSeparator(QObject* parent);

private slots:
    void addToJavaScript();

protected:
    void resizeEvent(QResizeEvent* event);
    void closeEvent(QCloseEvent *event);

private:
    QSettings*  m_settings;
    QWebView*   m_view;
};

#endif
