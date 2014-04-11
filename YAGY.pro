QT += webkit 
QT += widgets
QT += webkitwidgets
TARGET = YAGY
TEMPLATE = app
SOURCES += main.cpp \
    mainwindow.cpp 
HEADERS += mainwindow.h \
    config.h
FORMS += mainwindow.ui
RESOURCES += resources.qrc
JAVASCRIPT.files = javascript
QMAKE_BUNDLE_DATA += JAVASCRIPT
CSS.files = css
QMAKE_BUNDLE_DATA += CSS
CONFIG += lib_bundle
macx:LIBS += -framework CoreFoundation
ICON = icon.icns

YACAS_PREFIX = $$PWD/../../yacas/trunk-root

win32:CONFIG(release, debug|release): LIBS += -L$${YACAS_PREFIX}/lib/release/ -lyacas
else:win32:CONFIG(debug, debug|release): LIBS += -L$${YACAS_PREFIX}/lib/debug/ -lyacas
else:unix: LIBS += -L$${YACAS_PREFIX}/lib/ -lyacas

INCLUDEPATH += $${YACAS_PREFIX}/include
DEPENDPATH += $${YACAS_PREFIX}/include

win32-g++:CONFIG(release, debug|release): PRE_TARGETDEPS += $${YACAS_PREFIX}/lib/release/libyacas.a
else:win32-g++:CONFIG(debug, debug|release): PRE_TARGETDEPS += $${YACAS_PREFIX}/lib/debug/libyacas.a
else:win32:!win32-g++:CONFIG(release, debug|release): PRE_TARGETDEPS += $${YACAS_PREFIX}/lib/release/yacas.lib
else:win32:!win32-g++:CONFIG(debug, debug|release): PRE_TARGETDEPS += $${YACAS_PREFIX}/lib/debug/yacas.lib
else:unix: PRE_TARGETDEPS += $${YACAS_PREFIX}/lib/libyacas.a
