cmake_minimum_required (VERSION 2.8.11)

project (YAGY CXX)

set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -pedantic -Wall -DYAGY_ENABLE_INSPECTOR")

set (YACAS_PREFIX "${PROJECT_SOURCE_DIR}/../../yacas/yacas-trunk/install/linux/release")

set (YAGY_VERSION_MAJOR 1)
set (YAGY_VERSION_MINOR 0)
set (YAGY_VERSION_MICRO 0)

set (YAGY_VERSION ${YAGY_VERSION_MAJOR}.${YAGY_VERSION_MINOR}.${YAGY_VERSION_MICRO})

configure_file (
  "version.h.in"
  "version.h"
  )

configure_file (
  "config.h.in"
  "config.h"
  )


set (CMAKE_INCLUDE_CURRENT_DIR ON)
set (CMAKE_AUTOMOC ON)

find_package (Qt5Core REQUIRED)
find_package (Qt5Widgets REQUIRED)
find_package (Qt5WebKit REQUIRED)
find_package (Qt5WebKitWidgets REQUIRED)

if (Qt5_POSITION_INDEPENDENT_CODE)
  set(CMAKE_POSITION_INDEPENDENT_CODE ON)
endif()

include_directories (
  "${YACAS_PREFIX}/include"
  )

qt5_wrap_ui (ui_mainwindow.h mainwindow.ui)

qt5_add_resources (qrc_resources.cpp resources.qrc)
qt5_add_resources (qrc_img.cpp img.qrc)

set (YAGY_QRESOURCES qrc_resources.cpp qrc_img.cpp)

if (NOT APPLE)
    qt5_add_resources (qrc_css.cpp css.qrc)
    qt5_add_resources (qrc_flot.cpp flot.qrc)
    qt5_add_resources (qrc_jquery.cpp jquery.qrc)
    qt5_add_resources (qrc_mathjax.cpp mathjax.qrc -compress 9)
    qt5_add_resources (qrc_three.cpp three.qrc)
    qt5_add_resources (qrc_slot.cpp slot.qrc)

    set (YAGY_QRESOURCES ${YAGY_QRESOURCES} qrc_css.cpp qrc_flot.cpp qrc_jquery.cpp qrc_mathjax.cpp qrc_three.cpp qrc_slot.cpp)
endif ()


add_executable (yagy main.cpp mainwindow.cpp cellproxy.cpp yacasrequest.cpp yacasengine.cpp yacasserver.cpp ui_mainwindow.h ${YAGY_QRESOURCES})

add_library (libyacas SHARED IMPORTED)
set_target_properties (libyacas PROPERTIES IMPORTED_LOCATION "${YACAS_PREFIX}/lib/libyacas.so")

target_link_libraries(yagy Qt5::Widgets Qt5::WebKit Qt5::WebKitWidgets libyacas)

install (TARGETS yagy RUNTIME DESTINATION bin)

if (${CMAKE_SYSTEM_NAME} STREQUAL "Linux")
    set (CPACK_GENERATOR DEB)
    execute_process (COMMAND dpkg --print-architecture OUTPUT_VARIABLE CPACK_DEBIAN_PACKAGE_ARCHITECTURE)
    string (REGEX REPLACE "(\r?\n)+$" "" CPACK_DEBIAN_PACKAGE_ARCHITECTURE "${CPACK_DEBIAN_PACKAGE_ARCHITECTURE}")
    set (CPACK_DEBIAN_PACKAGE_DEPENDS "yacas")
    set (CPACK_PACKAGE_FILE_NAME "yagy_${YAGY_VERSION}-1_${CPACK_DEBIAN_PACKAGE_ARCHITECTURE}")
endif ()

set (CPACK_PACKAGE_NAME "yagy")
set (CPACK_PACKAGE_VENDOR "yagy")
set (CPACK_PACKAGE_CONTACT "yagy-devel@lists.sourceforge.net")
set (CPACK_PACKAGE_DESCRIPTION_SUMMARY "YAGY is (Yet Another) Graphical interface to YACAS, a Yet Another Computer Algebra System")
set (CPACK_PACKAGE_DESCRIPTION_FILE "${PROJECT_SOURCE_DIR}/README")

if(APPLE)
  configure_file(
    "${PROJECT_SOURCE_DIR}/COPYING"
    "${PROJECT_BINARY_DIR}/COPYING.txt"
    @ONLY)
  configure_file(
    "${PROJECT_SOURCE_DIR}/README"
    "${PROJECT_BINARY_DIR}/README.txt"
    @ONLY)
  set (CPACK_RESOURCE_FILE_LICENSE "${PROJECT_BINARY_DIR}/COPYING.txt")
  set (CPACK_RESOURCE_FILE_README "${PROJECT_BINARY_DIR}/README.txt")
else()
  set (CPACK_RESOURCE_FILE_LICENSE "${PROJECT_SOURCE_DIR}/COPYING")
  set (CPACK_RESOURCE_FILE_README "${PROJECT_SOURCE_DIR}/README")
endif()

set (CPACK_PACKAGE_VERSION ${YAGY_VERSION})
set (CPACK_PACKAGE_VERSION_MAJOR ${YAGY_VERSION_MAJOR})
set (CPACK_PACKAGE_VERSION_MINOR ${YAGY_VERSION_MINOR})
set (CPACK_PACKAGE_VERSION_PATCH ${YAGY_VERSION_MICRO})
set (CPACK_PACKAGE_INSTALL_DIRECTORY "yagy")
set (CPACK_PACKAGE_EXECUTABLES yagy;Yagy)

include (CPack)
