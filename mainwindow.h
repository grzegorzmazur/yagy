#ifndef MAINWINDOW_H
#define MAINWINDOW_H

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

    // meant to be private
    Q_INVOKABLE QString eval(QString expr);

protected:
    void loadYacasPage();
    
private slots:
    void initObjectMapping();

private:
    Ui::MainWindow* ui;

    CYacas* yacas;
    CYacas* yacas2tex;
};

#endif // MAINWINDOW_H
