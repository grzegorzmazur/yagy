cmake_minimum_required (VERSION 2.8.11)

project (YAGY CXX)

set(YACAS_PREFIX "" CACHE FILEPATH "Yacas installation root")

if(NOT EXISTS ${YACAS_PREFIX}/include/yacas/yacas.h)
  message(SEND_ERROR "Can't find yacas.h in ${YACAS_PREFIX}/include/yacas")
endif()

if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU" OR "${CMAKE_CXX_COMPILER_ID}" STREQUAL "Clang")
    set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pedantic -Wall -std=c++11")
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    add_definitions(-DYACAS_NO_CONSTEXPR)
endif ()

add_definitions(-DYAGY_ENABLE_INSPECTOR)

set (YAGY_VERSION_MAJOR 1)
set (YAGY_VERSION_MINOR 0)
set (YAGY_VERSION_MICRO 0)

set (YAGY_VERSION ${YAGY_VERSION_MAJOR}.${YAGY_VERSION_MINOR}.${YAGY_VERSION_MICRO})

configure_file (
  "version.h.in"
  "version.h"
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

qt5_add_resources (qrc_html.cpp html.qrc)
qt5_add_resources (qrc_img.cpp img.qrc)

set (YAGY_QRESOURCES qrc_html.cpp qrc_img.cpp)

if (NOT APPLE)
    qt5_add_resources (qrc_css.cpp css.qrc)
    qt5_add_resources (qrc_javascript.cpp javascript.qrc)

    set (YAGY_QRESOURCES ${YAGY_QRESOURCES} qrc_css.cpp qrc_javascript.cpp)
endif ()

set (YAGY_SOURCES main.cpp mainwindow.cpp cellproxy.cpp yacasrequest.cpp yacasengine.cpp yacasserver.cpp ui_mainwindow.h)

if (WIN32)
    set (YAGY_SOURCES ${YAGY_SOURCES} winres/yagy.rc)
endif ()

add_executable (yagy ${YAGY_SOURCES} ${YAGY_QRESOURCES})

add_library (libyacas STATIC IMPORTED)
set_target_properties (libyacas PROPERTIES IMPORTED_LOCATION "${YACAS_PREFIX}/lib/libyacas.a")

target_link_libraries(yagy Qt5::Widgets Qt5::WebKit Qt5::WebKitWidgets libyacas)

if (WIN32)
  target_link_libraries (yagy shlwapi)
endif()

install (TARGETS yagy RUNTIME DESTINATION bin)
install (DIRECTORY ${YACAS_PREFIX}/share/yacas/scripts DESTINATION share/yagy)

if (WIN32)
    # FIXME: this is plain ugly, there must be a better way
    # install all the dlls we use
    install (FILES "/usr/lib/gcc/i686-w64-mingw32/4.8/libgcc_s_sjlj-1.dll" DESTINATION bin)
    get_target_property(QtCore_location Qt5::Core LOCATION)
    get_filename_component(QT_DLL_DIR ${QtCore_location} DIRECTORY)

    set (QT_DLLS libgcc_s_dw2-1.dll libstdc++-6.dll libwinpthread-1.dll Qt5WebKit.dll Qt5WebKitWidgets.dll icuin52.dll icuuc52.dll icudt52.dll Qt5Core.dll  Qt5Gui.dll Qt5Multimedia.dll Qt5MultimediaWidgets.dll Qt5Network.dll Qt5OpenGL.dll Qt5Positioning.dll Qt5PrintSupport.dll Qt5Qml.dll Qt5Quick.dll Qt5Sensors.dll Qt5Sql.dll Qt5Svg.dll Qt5Widgets.dll)
    foreach (_dll ${QT_DLLS})
        install (FILES "${QT_DLL_DIR}/${_dll}" DESTINATION bin)
    endforeach ()
    
    install (DIRECTORY "${QT_DLL_DIR}/../plugins/platforms" DESTINATION bin)
    install (DIRECTORY "${QT_DLL_DIR}/../plugins/imageformats" DESTINATION bin)
    install (DIRECTORY "${QT_DLL_DIR}/../plugins/iconengines" DESTINATION bin)
endif ()

if (${CMAKE_SYSTEM_NAME} STREQUAL "Linux")
    set (CPACK_GENERATOR DEB)
    execute_process (COMMAND dpkg --print-architecture OUTPUT_VARIABLE CPACK_DEBIAN_PACKAGE_ARCHITECTURE)
    string (REGEX REPLACE "(\r?\n)+$" "" CPACK_DEBIAN_PACKAGE_ARCHITECTURE "${CPACK_DEBIAN_PACKAGE_ARCHITECTURE}")
    set (CPACK_DEBIAN_PACKAGE_DEPENDS "yacas")
    set (CPACK_PACKAGE_FILE_NAME "yagy_${YAGY_VERSION}-1_${CPACK_DEBIAN_PACKAGE_ARCHITECTURE}")
elseif (WIN32)
    set (CPACK_GENERATOR NSIS)
    set (CPACK_NSIS_MODIFY_PATH "ON")
    set (CPACK_NSIS_ENABLE_UNINSTALL_BEFORE_INSTALL "ON")
    set (CPACK_NSIS_HELP_LINK "http://yagy.sourceforge.net/")
    set (CPACK_NSIS_URL_INFO_ABOUT "http://yagy.sourceforge.net/")
    set (CPACK_NSIS_MUI_ICON "${PROJECT_SOURCE_DIR}/winres/yagy.ico")
    set (CPACK_NSIS_INSTALLED_ICON_NAME "bin\\\\yagy.exe")
    set (CPACK_CREATE_DESKTOP_LINKS "yagy.exe" "yagy")
endif ()

set (CPACK_PACKAGE_NAME "yagy")
set (CPACK_PACKAGE_VENDOR "yagy")
set (CPACK_PACKAGE_CONTACT "yagy-devel@lists.sourceforge.net")
set (CPACK_PACKAGE_DESCRIPTION_SUMMARY "YAGY is (Yet Another) Graphical interface to YACAS, a Yet Another Computer Algebra System")
set (CPACK_PACKAGE_DESCRIPTION_FILE "${PROJECT_SOURCE_DIR}/README")

set (CPACK_RESOURCE_FILE_LICENSE "${PROJECT_SOURCE_DIR}/COPYING")
set (CPACK_RESOURCE_FILE_README "${PROJECT_SOURCE_DIR}/README")

set (CPACK_PACKAGE_VERSION ${YAGY_VERSION})
set (CPACK_PACKAGE_VERSION_MAJOR ${YAGY_VERSION_MAJOR})
set (CPACK_PACKAGE_VERSION_MINOR ${YAGY_VERSION_MINOR})
set (CPACK_PACKAGE_VERSION_PATCH ${YAGY_VERSION_MICRO})
set (CPACK_PACKAGE_INSTALL_DIRECTORY "yagy")
set (CPACK_PACKAGE_EXECUTABLES yagy;Yagy)

include (CPack)
