#ifndef HOSTWINDOW_H
#define HOSTWINDOW_H

#include <QMainWindow>
class QSettings;
class QWebView;
class QWebInspector;

class HostWindow : public QMainWindow
{
    Q_OBJECT
public:
    explicit HostWindow(QWidget *parent = 0);
    virtual ~HostWindow();

// Host Interface
public:
    Q_INVOKABLE void openShell();

    Q_INVOKABLE QObject* addMenu(QObject* parent, const QString& title);
    Q_INVOKABLE QObject* addMenuItem(QObject* parent);
    Q_INVOKABLE void addMenuSeparator(QObject* parent);
    Q_INVOKABLE void updateMenuItemShortcut(QObject* item, const QString& shortcut);
    Q_INVOKABLE void removeMenuItem(QObject* parent, QObject* item);

    Q_INVOKABLE QString openFilePrompt(const QString& filter, const QString& initialDirectory);
    Q_INVOKABLE QString saveFilePrompt(const QString& filter, const QString& initialDirectory);

    Q_INVOKABLE QString readFile(const QString& fileLocation, bool binary, const QString& encoding);
    Q_INVOKABLE bool writeFile(const QString& fileLocation, const QString& data, bool binary, const QString& encoding);

private slots:
    void addToJavaScript();

protected:
    void resizeEvent(QResizeEvent* event);
    void closeEvent(QCloseEvent *event);

private:
    QSettings*      m_settings;
    QWebView*       m_view;
#ifdef QT_DEBUG
    QWebInspector*  m_inspector;
#endif
};

#endif
