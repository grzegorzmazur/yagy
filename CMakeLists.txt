cmake_minimum_required (VERSION 2.8.11)

project (YAGY CXX)

if (WIN32)
    set(YACAS_PREFIX "C:/Program Files/yacas" CACHE FILEPATH "Yacas installation root")
else ()
    set(YACAS_PREFIX "/usr" CACHE FILEPATH "Yacas installation root")
endif ()

if(NOT EXISTS ${YACAS_PREFIX}/include/yacas/yacas.h)
  message(SEND_ERROR "Can't find yacas.h in ${YACAS_PREFIX}/include/yacas")
endif()

if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU" OR "${CMAKE_CXX_COMPILER_ID}" STREQUAL "Clang")
    set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pedantic -Wall -std=c++11")
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
    add_definitions(-DYACAS_NO_CONSTEXPR)
endif ()

set (YAGY_VERSION_MAJOR 1)
set (YAGY_VERSION_MINOR 1)
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
find_package (Qt5PrintSupport REQUIRED)

if (Qt5_POSITION_INDEPENDENT_CODE)
  set(CMAKE_POSITION_INDEPENDENT_CODE ON)
endif()

include_directories (
  "${YACAS_PREFIX}/include"
  )

# seems to be required for older qt5 cmake modules
include_directories (
    ${Qt5Core_INCLUDE_DIRS}
    ${Qt5Widgets_INCLUDE_DIRS}
    ${Qt5WebKit_INCLUDE_DIRS}
    ${Qt5WebKitWidgets_INCLUDE_DIRS}
    ${Qt5PrintSupport_INCLUDE_DIRS}
)

qt5_wrap_ui (ui_mainwindow.h mainwindow.ui)
qt5_wrap_ui (ui_preferences_dialog.h preferences_dialog.ui)

qt5_add_resources (qrc_img.cpp img.qrc --compress 9)

set (YAGY_QRESOURCES qrc_img.cpp)

set (YAGY_SOURCES
    main.cpp mainwindow.cpp cellproxy.cpp yacasrequest.cpp yacasengine.cpp
    yacasserver.cpp preferences_dialog.cpp preferences.cpp
    cellproxy.h preferences_dialog.h yacasengine.h yacasserver.h
    mainwindow.h preferences.h yacasrequest.h    
    ui_mainwindow.h ui_preferences_dialog.h
)

if (WIN32)
    set (YAGY_SOURCES ${YAGY_SOURCES} winres/yagy.rc)
endif ()

if (APPLE OR WIN32)
    add_definitions(-DNO_GLOBALS)
endif ()

add_executable (yagy ${YAGY_SOURCES} ${YAGY_QRESOURCES})

add_library (libyacas STATIC IMPORTED)

if (MSVC)
    set_target_properties (libyacas PROPERTIES IMPORTED_LOCATION "${YACAS_PREFIX}/lib/yacas.lib")
else ()
    set_target_properties (libyacas PROPERTIES IMPORTED_LOCATION "${YACAS_PREFIX}/lib/libyacas.a")
endif ()

target_link_libraries(yagy Qt5::Core Qt5::Widgets Qt5::WebKit Qt5::WebKitWidgets Qt5::PrintSupport libyacas)

if (WIN32)
    target_link_libraries (yagy shlwapi)
    set_target_properties(yagy PROPERTIES WIN32_EXECUTABLE YES)
endif()

set_property (TARGET yagy APPEND PROPERTY
    COMPILE_DEFINITIONS $<$<CONFIG:Debug>:YAGY_ENABLE_INSPECTOR>
)

add_subdirectory(resources)

install (TARGETS yagy DESTINATION bin)
install (DIRECTORY ${YACAS_PREFIX}/share/yacas/scripts DESTINATION share/yagy)
install (DIRECTORY ${YACAS_PREFIX}/share/yacas/documentation DESTINATION share/yagy)

install (FILES resources/img/yagy.png DESTINATION share/yagy)

if (${CMAKE_SYSTEM_NAME} STREQUAL "Linux")
    install (FILES debian/copyright DESTINATION share/doc/yagy)

    find_package (UnixCommands REQUIRED)
    add_custom_target (compress_changelog ALL COMMAND ${GZIP} -9 -c ${PROJECT_SOURCE_DIR}/debian/changelog > changelog.gz)

    install (FILES ${PROJECT_BINARY_DIR}/changelog.gz DESTINATION share/doc/yagy)

    install (PROGRAMS yagy.desktop PERMISSIONS OWNER_WRITE OWNER_READ GROUP_READ WORLD_READ DESTINATION share/applications)

    find_program (RST2MAN rst2man)

    if (RST2MAN)
        add_custom_target (man ALL COMMAND ${RST2MAN} ${PROJECT_SOURCE_DIR}/yagy.1.rst | ${GZIP} -9 > yagy.1.gz)
        install (FILES ${PROJECT_BINARY_DIR}/yagy.1.gz DESTINATION share/man/man1)
    endif ()

endif ()

if (WIN32)
    # FIXME: this is plain ugly, there must be a better way
    # install all the dlls we use
	
    get_target_property(QtCore_location Qt5::Core LOCATION)
    get_filename_component(QT_DLL_DIR ${QtCore_location} DIRECTORY)
	
    set (QT_DLLS Qt5WebKit.dll Qt5WebKitWidgets.dll Qt5WebChannel.dll icuin54.dll icuuc54.dll icudt54.dll Qt5Core.dll  Qt5Gui.dll Qt5Multimedia.dll Qt5MultimediaWidgets.dll Qt5Network.dll Qt5OpenGL.dll Qt5Positioning.dll Qt5PrintSupport.dll Qt5Qml.dll Qt5Quick.dll Qt5Sensors.dll Qt5Sql.dll Qt5Svg.dll Qt5Widgets.dll)
    
    if (CMAKE_CROSSCOMPILING)
        exec_program (${CMAKE_CXX_COMPILER} ARGS -print-file-name=libgcc_s_sjlj-1.dll OUTPUT_VARIABLE SJLJ_PATH)
        install (FILES ${SJLJ_PATH} DESTINATION bin)
        set (QT_DLLS ${QT_DLLS} libgcc_s_dw2-1.dll libstdc++-6.dll libwinpthread-1.dll )	
    endif ()
    
    foreach (_dll ${QT_DLLS})
        install (FILES "${QT_DLL_DIR}/${_dll}" DESTINATION bin)
    endforeach ()
    
    install (DIRECTORY "${QT_DLL_DIR}/../plugins/platforms" DESTINATION bin)
    install (DIRECTORY "${QT_DLL_DIR}/../plugins/imageformats" DESTINATION bin)
    install (DIRECTORY "${QT_DLL_DIR}/../plugins/iconengines" DESTINATION bin)
endif ()

set (CPACK_SOURCE_GENERATOR "TGZ")
set (CPACK_SOURCE_IGNORE_FILES "/build/;/.svn/;/install/;/nbproject/;~$;${CPACK_SOURCE_IGNORE_FILES}")
set (CPACK_SOURCE_PACKAGE_FILE_NAME "yagy_${YAGY_VERSION}")

if (${CMAKE_SYSTEM_NAME} STREQUAL "Linux")
    set (CPACK_GENERATOR DEB)
    execute_process (COMMAND dpkg --print-architecture OUTPUT_VARIABLE CPACK_DEBIAN_PACKAGE_ARCHITECTURE)
    string (REGEX REPLACE "(\r?\n)+$" "" CPACK_DEBIAN_PACKAGE_ARCHITECTURE "${CPACK_DEBIAN_PACKAGE_ARCHITECTURE}")
    set (CPACK_PACKAGE_FILE_NAME "yagy_${YAGY_VERSION}-1_${CPACK_DEBIAN_PACKAGE_ARCHITECTURE}")
    set (CPACK_DEBIAN_PACKAGE_ENHANCES "yacas")
    set (CPACK_DEBIAN_PACKAGE_DESCRIPTION "Yet Another GUI for Yacas
 Yagy is a graphical user interface for Yacas, a small and highly flexible
 computer algebra system.")
    set (CPACK_DEBIAN_PACKAGE_SECTION "math")
    set (CPACK_DEBIAN_PACKAGE_SHLIBDEPS ON)
elseif (WIN32)
    include( InstallRequiredSystemLibraries )
    if ("${CMAKE_SIZEOF_VOID_P}" EQUAL "8")
        set (CPACK_NSIS_EXTRA_PREINSTALL_COMMANDS  "SetRegView 64")
        set (CPACK_NSIS_INSTALL_ROOT "$PROGRAMFILES64")
    endif ()
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
set (CPACK_PACKAGE_VENDOR "Yagy Team")
set (CPACK_PACKAGE_CONTACT "Yagy Team <yagy-devel@lists.sourceforge.net>")
set (CPACK_PACKAGE_DESCRIPTION_SUMMARY "Yet Another GUI for Yacas")
set (CPACK_PACKAGE_DESCRIPTION_FILE "${PROJECT_SOURCE_DIR}/README.rst")

set (CPACK_RESOURCE_FILE_LICENSE "${PROJECT_SOURCE_DIR}/COPYING")
set (CPACK_RESOURCE_FILE_README "${PROJECT_SOURCE_DIR}/README.rst")

set (CPACK_PACKAGE_VERSION ${YAGY_VERSION})
set (CPACK_PACKAGE_VERSION_MAJOR ${YAGY_VERSION_MAJOR})
set (CPACK_PACKAGE_VERSION_MINOR ${YAGY_VERSION_MINOR})
set (CPACK_PACKAGE_VERSION_PATCH ${YAGY_VERSION_MICRO})
set (CPACK_PACKAGE_INSTALL_DIRECTORY "yagy")
set (CPACK_PACKAGE_EXECUTABLES yagy;Yagy)
set (CPACK_STRIP_FILES TRUE)

include (CPack)
