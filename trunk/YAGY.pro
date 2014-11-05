TARGET = YAGY
TEMPLATE = app
QMAKE_CXXFLAGS += -std=c++11
SOURCES += main.cpp mainwindow.cpp cellproxy.cpp yacasrequest.cpp yacasengine.cpp yacasserver.cpp preferences_dialog.cpp
HEADERS += mainwindow.h cellproxy.h yacasrequest.h yacasserver.h yacasengine.h preferences_dialog.h	
FORMS += mainwindow.ui preferences.ui
RESOURCES += img.qrc
QT += webkit widgets webkitwidgets
CONFIG += c++11
ICON = icon.icns

macx{
    YACAS_PREFIX = ../../yacas/code/Debug

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
    QMAKE_BUNDLE_DATA += CSS JAVASCRIPT FRAMEWORK IMG HTML
    
    CONFIG += lib_bundle
} else {
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
