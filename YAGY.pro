QT += webkit 
QT += widgets
QT += webkitwidgets
TARGET = YAGY
TEMPLATE = app
SOURCES += main.cpp \
    mainwindow.cpp 
HEADERS += mainwindow.h
FORMS += mainwindow.ui
RESOURCES += resources.qrc
JAVASCRIPT.files = javascript
QMAKE_BUNDLE_DATA += JAVASCRIPT
CSS.files = css
QMAKE_BUNDLE_DATA += CSS
CONFIG += lib_bundle
macx:LIBS += -framework CoreFoundation
ICON = icon.icns