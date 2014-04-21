cmake_minimum_required (VERSION 2.8.11)

set (CMAKE_PREFIX_PATH "/opt/Qt5.2.1/5.2.1/gcc_64/")

set (YACAS_PREFIX "${PROJECT_SOURCE_DIR}/../../yacas/trunk-root")

set (CMAKE_INCLUDE_CURRENT_DIR ON)
set (CMAKE_AUTOMOC ON)

find_package (Qt5Core)
find_package (Qt5Widgets)
find_package (Qt5WebKit)
find_package (Qt5WebKitWidgets)

if (Qt5_POSITION_INDEPENDENT_CODE)
  set(CMAKE_POSITION_INDEPENDENT_CODE ON)
endif()

include_directories (
  "${YACAS_PREFIX}/include"
  )

qt5_wrap_ui (ui_mainwindow.h mainwindow.ui)
qt5_add_resources (qrc_resources.cpp resources.qrc)

add_executable (yagy main.cpp mainwindow.cpp cellproxy.cpp yacasrequest.cpp yacasengine.cpp yacasserver.cpp qrc_resources.cpp ui_mainwindow.h)

add_library (libyacas SHARED IMPORTED)
set_target_properties (libyacas PROPERTIES IMPORTED_LOCATION "${YACAS_PREFIX}/lib/libyacas.so")

target_link_libraries(yagy Qt5::Widgets Qt5::WebKit Qt5::WebKitWidgets libyacas)
