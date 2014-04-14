#include "mainwindow.h"

#include <QtWidgets/QApplication>
#include <QtWidgets/QSplashScreen>
#include <QtGui/QBitmap>
#include <QtGui/QPixmap>
#include <QtCore/QTimer>

void addSplashScreen( MainWindow* widget );

int main(int argc, char *argv[]){
    
        // switch yacas memory manager to thread-safe mode
        PlatObSetThreadSafe(true);
    
	QApplication app(argc, argv);
    
	MainWindow  *widget = new MainWindow ();
    
    #ifndef __APPLE__
        addSplashScreen( widget );
    #endif
        
	widget->show();
    
	return app.exec();
}

void addSplashScreen( MainWindow* widget )
{
    QPixmap si(":/img/splash.png");
    QSplashScreen ss(widget, si, Qt::WindowStaysOnTopHint);
    ss.setMask(si.mask());
    ss.showFullScreen();
    QTimer::singleShot(3000, &ss, SLOT(close()));
}
