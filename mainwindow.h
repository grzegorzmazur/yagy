#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QtCore/QMap>
#include <QtCore/QVariant>

#include <QtWidgets/QMainWindow>

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

protected:
    void loadYacasPage();
    
private slots:
    void initObjectMapping();

    void on_action_New_triggered();
    void on_action_Open_triggered();
    void on_action_Save_triggered();
    void on_action_Save_As_triggered();
    void on_action_Quit_triggered();
    void on_action_About_triggered();

private:
    Ui::MainWindow* ui;

    CYacas* yacas;
    LispString side_effects;
    
    CYacas* yacas2tex;
};

#endif // MAINWINDOW_H
