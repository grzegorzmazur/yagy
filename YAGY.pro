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

ICON = icon.icns

macx{

    YACAS_PREFIX = ../yacas/build/Release

    CONFIG(debug, debug|release) {
        DEFINES += YAGY_ENABLE_INSPECTOR
    } else {
        DEFINES += QT_NO_DEBUG_OUTPUT
    }

    LIBS += -framework CoreFoundation
    LIBS += -F$${YACAS_PREFIX} -framework yacas
    INCLUDEPATH += $${YACAS_PREFIX}/yacas.framework/Headers
    
    QMAKE_LFLAGS += "-rpath @loader_path/../SharedFrameworks"

    FRAMEWORK.files = $${YACAS_PREFIX}/yacas.framework
    FRAMEWORK.path = Contents/SharedFrameworks
    
    CODEMIRROR.files = resources/codemirror
    CSS.files = resources/css
    FLOT.files = resources/flot
    FONTS.files = resources/fonts
    IMAGES.files = resources/images
    IMG.files = resources/img
    JQUERY.files = resources/jquery
    MATHBAR.files = resources/mathbar
    MATHJAX.files = resources/mathjax
    PLOT3D.files = resources/plot3d
    THREE.files = resources/three
    VIS.files = resources/vis
    YAGY_UI.files = resources/yagy_ui
    YAGY_UI_HTML.files = resources/yagy_ui.html
QMAKE_BUNDLE_DATA += CSS JAVASCRIPT FRAMEWORK CODEMIRROR CSS FLOT FONTS IMAGES IMG JQUERY MATHBAR MATHJAX PLOT3D THREE VIS YAGY_UI YAGY_UI_HTML


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
