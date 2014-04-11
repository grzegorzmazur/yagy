#include <QApplication>
#include "mainwindow.h"

#include <iostream>

using namespace std;



int main(int argc, char *argv[]){
	QApplication app(argc, argv);
    
	MainWindow  *widget = new MainWindow ();
	widget->show();
    
	return app.exec();
}