cmake_minimum_required (VERSION 2.8.11)

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

install (TARGETS yagy RUNTIME DESTINATION bin)

if (${CMAKE_SYSTEM_NAME} STREQUAL "Linux")
    set (CPACK_GENERATOR DEB)
    set (CPACK_DEBIAN_PACKAGE_ARCHITECTURE "amd64")
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

set (CPACK_PACKAGE_VERSION "0.1.0")
set (CPACK_PACKAGE_VERSION_MAJOR 0)
set (CPACK_PACKAGE_VERSION_MINOR 1)
set (CPACK_PACKAGE_VERSION_PATCH 0)
set (CPACK_PACKAGE_INSTALL_DIRECTORY "yagy")
set (CPACK_PACKAGE_EXECUTABLES yagy;Yagy)



include (CPack)
