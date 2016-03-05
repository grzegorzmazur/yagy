====================================================================
Yagy, Yet Another GUI for Yacas, Yet Another Computer Algebra System
====================================================================

.. image:: https://travis-ci.org/grzegorzmazur/yagy.svg?branch=master
    :target: https://travis-ci.org/grzegorzmazur/yagy

Compilation instructions
========================

Prerequisites
_____________

1. yacas version 1.4.0

   - available from https://github.com/grzegorzmazur/yacas/releases/tag/v1.4.0

2. Qt 

   - available from http://qt-project.org/downloads
   - tested on the 5.4.2 version


Mac OS X
________

1. in the ``YAGY.pro`` file set the ``YACAS_PREFIX`` variable to point to a folder with the yacas framework
2. create an XCode project:
   
   - in Terminal go to the folder containing YAGY.pro and run the command::
       
     $$PATH_TO_QT_BIN_FOLDER$$/qmake -spec macx-xcode
          
   - in the same folder YAGY.xcodeproj is created
   
3. open YAGY.xcodeproj and update icons:
    
   - display YAGY target properties (click on YAGY in the Project Navigator)
   - go to the App Icons section and click on Use Asset Catalog and then confirm migration.

4. Run the YAGY target to compile and run app from the build folder (./Debug by default)

   - default configuration is Debug. To change to Release edit the YAGY scheme.

5. To create a distributable application with Qt frameworks included in the bundle run the following command::
    
     $$PATH_TO_QT_BIN_FOLDER$$/macdeployqt $$PATH_YAGY_BUILD_FOLDER$$/YAGY.app 

   - Ignore ``ERROR: no file at "/opt/local/lib/mysql55/lib/libmysqlclient.18.dylib"``
   - Option -dmg can be added to create a dmg image.
 

Windows
_______

1. To compile Yagy Yacas (yacas-1.4.0-win64.exe) has to be installed

   - if Yacas is compiled from sources the Release x64 configuration should be used

2. In the ``CMakeList.txt`` set the ``YACAS_PREFIX`` variable to point to the Yacas installation folder

   - it’s ``C:/Program Files/yacas`` by default

3. Generate Microsoft Visual Studio project using CMake

   - set configuration to ``Visual Studion 12 2013 Win64``

4. Build the ALL_BUILD solution to build the Yagy application
5. Build the PACKAGE solution to create an installation package


Linux
_____

1. To compile Yagy, Yacas (yacas_1.4.0-1_amd64.deb) has to be installed
2. In the ``CMakeList.txt`` set the ``YACAS_PREFIX`` variable to point to the Yacas installation folder

   - it’s ``/usr`` by default

3. Generate Makefile using CMake
4. Build executable using the ``make`` command
5. Either install using ``make install`` or build package using ``make package`` and install it

