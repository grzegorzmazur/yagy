#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QtCore/QMap>
#include <QtCore/QVariant>

#include <QtWidgets/QMainWindow>

#include <QtPrintSupport/QPrinter>

#include "yacasserver.h"
#include "yacas/yacas.h"

namespace Ui {
    class MainWindow;
}

class MainWindow : public QMainWindow {
    Q_OBJECT
public:
    MainWindow(QWidget* parent = 0);
    ~MainWindow();

public slots:
    void eval(int idx, QString expr);
    void help(QString, int);

protected:
    void loadYacasPage();
    
private slots:
    void initObjectMapping();

    void print(QPrinter*);
    
    void on_action_New_triggered();
    void on_action_Open_triggered();
    void on_action_Save_triggered();
    void on_action_Save_As_triggered();
    void on_action_Print_triggered();
    void on_action_Quit_triggered();
    void on_actionYacas_Manual_triggered();
    void on_action_About_triggered();

private:
    Ui::MainWindow* ui;

    YacasServer _yacas_server;    
    CYacas _yacas2tex;
    
    QScopedPointer<QPrinter> _printer;
};

#endif // MAINWINDOW_H