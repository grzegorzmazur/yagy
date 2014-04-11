#include "mainwindow.h"

#include <QApplication>
#include <QBitmap>
#include <QPixmap>
#include <QSplashScreen>
#include <QTimer>


int main(int argc, char *argv[]){
	QApplication app(argc, argv);
    
	MainWindow  *widget = new MainWindow ();
        
        QPixmap si(":/img/splash.png");
        QSplashScreen ss(widget, si, Qt::WindowStaysOnTopHint);
        ss.setMask(si.mask());
        ss.showFullScreen();
        QTimer::singleShot(3000, &ss, SLOT(close()));

        
	widget->show();
    
	return app.exec();
}