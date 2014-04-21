TARGET = YAGY
TEMPLATE = app
SOURCES += main.cpp mainwindow.cpp cellproxy.cpp yacasrequest.cpp yacasengine.cpp yacasserver.cpp
HEADERS += mainwindow.h config.h
FORMS += mainwindow.ui
RESOURCES += resources.qrc
QT += webkit widgets webkitwidgets
ICON = icon.icns

macx{
    YACAS_PREFIX = /Users/Marta/Documents/Grzesiek/yacas/code/build/Debug

    LIBS += -framework CoreFoundation
    LIBS += -F$${YACAS_PREFIX} -framework yacas
    INCLUDEPATH += $${YACAS_PREFIX}/yacas.framework/Headers
    
    QMAKE_LFLAGS += "-rpath @loader_path/../SharedFrameworks"

    FRAMEWORK.files = $${YACAS_PREFIX}/yacas.framework
    FRAMEWORK.path = Contents/SharedFrameworks
    
    JAVASCRIPT.files = javascript
    CSS.files = css
    QMAKE_BUNDLE_DATA += CSS JAVASCRIPT FRAMEWORK
    
    CONFIG += lib_bundle
}else{

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

}
