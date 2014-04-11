#include "mainwindow.h"

#include <QApplication>
#include <QBitmap>
#include <QPixmap>
#include <QSplashScreen>
#include <QTimer>

void addSplashScreen( MainWindow* widget );

int main(int argc, char *argv[]){
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