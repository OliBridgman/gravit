greaterThan(QT_MAJOR_VERSION, 4):QT += widgets webkitwidgets

TARGET = Gravit

ICON = ../assets/icon/app_icon.icns

SOURCES += shell.cpp \
    shellwindow.cpp

HEADERS += \
    shellwindow.h
