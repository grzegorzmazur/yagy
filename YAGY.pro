TARGET = YAGY
TEMPLATE = app

SOURCES += main.cpp mainwindow.cpp cellproxy.cpp yacasrequest.cpp yacasengine.cpp yacasserver.cpp preferences_dialog.cpp preferences.cpp
HEADERS += mainwindow.h cellproxy.h yacasrequest.h yacasserver.h yacasengine.h preferences_dialog.h	preferences.h
FORMS += mainwindow.ui preferences_dialog.ui
RESOURCES += img.qrc
QT += webkit widgets webkitwidgets svg
CONFIG += c++11
QMAKE_CXXFLAGS += -std=c++11

CONFIG += debug
CONFIG += release

ICON = icon.icns

macx{

    CONFIG(debug, debug|release) {
        YACAS_PREFIX = ../../yacas/code/Debug
    } else {
        YACAS_PREFIX = ../../yacas/code/Release
        DEFINES += QT_NO_DEBUG_OUTPUT
    }

    LIBS += -framework CoreFoundation
    LIBS += -F$${YACAS_PREFIX} -framework yacas
    INCLUDEPATH += $${YACAS_PREFIX}/yacas.framework/Headers
    
    QMAKE_LFLAGS += "-rpath @loader_path/../SharedFrameworks"

    FRAMEWORK.files = $${YACAS_PREFIX}/yacas.framework
    FRAMEWORK.path = Contents/SharedFrameworks
    
    JAVASCRIPT.files = resources/javascript
    CSS.files = resources/css
    IMG.files = resources/img
    HTML.files = resources/html
    VIS.files = resources/vis
    QMAKE_BUNDLE_DATA += CSS JAVASCRIPT FRAMEWORK IMG HTML VIS
    
    CONFIG += lib_bundle

} else {
    error(ERROR: Use QMake on MacOS platform only. For other platform please use CMake - look for CMakeLists.txt )

    YACAS_PREFIX = $$PWD/../../yacas/trunk-root
    RESOURCES += css.qrc flot.qrc jquery.qrc mathjax.qrc three.qrc slot.qrc

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
