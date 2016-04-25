include (${CMAKE_ROOT}/Modules/ExternalProject.cmake)

ExternalProject_Add (codemirror
    PREFIX external_packages
    URL https://github.com/codemirror/CodeMirror/archive/5.14.2.zip
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND "")

install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/codemirror/lib DESTINATION share/yagy/resources/codemirror)
install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/codemirror/mode/yacas DESTINATION share/yagy/resources/codemirror/mode)
install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/codemirror/addon/edit DESTINATION share/yagy/resources/codemirror/addon)
install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/codemirror/addon/hint DESTINATION share/yagy/resources/codemirror/addon)

ExternalProject_Add (flot
    PREFIX external_packages
    URL https://github.com/flot/flot/archive/v0.8.3.zip
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND "")

install (FILES ${CMAKE_BINARY_DIR}/resources/external_packages/src/flot/jquery.flot.js ${CMAKE_BINARY_DIR}/resources/external_packages/src/flot/jquery.flot.resize.js DESTINATION share/yagy/resources/flot)

ExternalProject_Add (three
    PREFIX external_packages
    URL https://github.com/mrdoob/three.js/archive/r76.zip
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND "")

install (FILES ${CMAKE_BINARY_DIR}/resources/external_packages/src/three/build/three.min.js ${CMAKE_BINARY_DIR}/resources/external_packages/src/three/examples/js/Detector.js ${CMAKE_BINARY_DIR}/resources/external_packages/src/three/examples/js/controls/TrackballControls.js DESTINATION share/yagy/resources/three)

ExternalProject_Add (vis
    PREFIX external_packages
    URL https://github.com/almende/vis/archive/v4.16.1.zip
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND "")

install (FILES ${CMAKE_BINARY_DIR}/resources/external_packages/src/vis/dist/vis.min.css ${CMAKE_BINARY_DIR}/resources/external_packages/src/vis/dist/vis.min.js DESTINATION share/yagy/resources/vis)

ExternalProject_Add (mathjax
    PREFIX external_packages
    URL https://github.com/mathjax/MathJax/archive/2.6.1.zip
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND "")

install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/mathjax/fonts/HTML-CSS/STIX-Web/otf DESTINATION share/yagy/resources/fonts/HTML-CSS/STIX-Web)
install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/mathjax/fonts/HTML-CSS/STIX-Web/woff DESTINATION share/yagy/resources/fonts/HTML-CSS/STIX-Web)
install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/mathjax/fonts/HTML-CSS/TeX/otf DESTINATION share/yagy/resources/fonts/HTML-CSS/TeX)
install (DIRECTORY ${CMAKE_BINARY_DIR}/resources/external_packages/src/mathjax/unpacked DESTINATION share/yagy/resources/mathjax)

ExternalProject_Add (delanuay
    PREFIX external_packages
    URL https://github.com/ironwallaby/delaunay/archive/1.0.1.zip
    CONFIGURE_COMMAND ""
    BUILD_COMMAND ""
    INSTALL_COMMAND "")

install (FILES ${CMAKE_BINARY_DIR}/resources/external_packages/src/delanuay/delaunay.js DESTINATION share/yagy/resources/plot3d)

install (FILES plot3d/plot3d.js DESTINATION share/yagy/resources/plot3d)
install (DIRECTORY jquery DESTINATION share/yagy/resources)
install (DIRECTORY mathbar DESTINATION share/yagy/resources)
install (DIRECTORY yagy_ui DESTINATION share/yagy/resources)
install (FILES yagy_ui.html DESTINATION share/yagy/resources)
