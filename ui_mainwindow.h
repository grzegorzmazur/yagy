/********************************************************************************
** Form generated from reading UI file 'mainwindow.ui'
**
** Created by: Qt User Interface Compiler version 5.2.1
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_MAINWINDOW_H
#define UI_MAINWINDOW_H

#include <QtCore/QVariant>
#include <QtWebKitWidgets/QWebView>
#include <QtWidgets/QAction>
#include <QtWidgets/QApplication>
#include <QtWidgets/QButtonGroup>
#include <QtWidgets/QHeaderView>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QStatusBar>
#include <QtWidgets/QToolBar>
#include <QtWidgets/QVBoxLayout>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_MainWindow
{
public:
    QAction *actionNew;
    QAction *actionOpen;
    QAction *actionSave;
    QWidget *centralWidget;
    QVBoxLayout *verticalLayout;
    QWebView *webView;
    QStatusBar *statusBar;
    QToolBar *toolBar;

    void setupUi(QMainWindow *Yagy)
    {
        if (Yagy->objectName().isEmpty())
            Yagy->setObjectName(QStringLiteral("Yagy"));
        Yagy->resize(600, 800);
        QIcon icon;
        icon.addFile(QStringLiteral(":/img/icon.png"), QSize(), QIcon::Normal, QIcon::Off);
        Yagy->setWindowIcon(icon);
        Yagy->setToolButtonStyle(Qt::ToolButtonFollowStyle);
        Yagy->setDocumentMode(false);
        Yagy->setDockNestingEnabled(false);
        actionNew = new QAction(Yagy);
        actionNew->setObjectName(QStringLiteral("actionNew"));
        actionOpen = new QAction(Yagy);
        actionOpen->setObjectName(QStringLiteral("actionOpen"));
        actionSave = new QAction(Yagy);
        actionSave->setObjectName(QStringLiteral("actionSave"));
        centralWidget = new QWidget(Yagy);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        verticalLayout = new QVBoxLayout(centralWidget);
        verticalLayout->setSpacing(0);
        verticalLayout->setContentsMargins(11, 11, 11, 11);
        verticalLayout->setObjectName(QStringLiteral("verticalLayout"));
        verticalLayout->setContentsMargins(0, 0, 0, 0);
        webView = new QWebView(centralWidget);
        webView->setObjectName(QStringLiteral("webView"));
        webView->setUrl(QUrl(QStringLiteral("qrc:/view.html")));

        verticalLayout->addWidget(webView);

        Yagy->setCentralWidget(centralWidget);
        statusBar = new QStatusBar(Yagy);
        statusBar->setObjectName(QStringLiteral("statusBar"));
        Yagy->setStatusBar(statusBar);
        toolBar = new QToolBar(Yagy);
        toolBar->setObjectName(QStringLiteral("toolBar"));
        toolBar->setMovable(false);
        toolBar->setFloatable(false);
        Yagy->addToolBar(Qt::TopToolBarArea, toolBar);

        toolBar->addAction(actionNew);
        toolBar->addAction(actionOpen);
        toolBar->addAction(actionSave);

        retranslateUi(Yagy);

        QMetaObject::connectSlotsByName(Yagy);
    } // setupUi

    void retranslateUi(QMainWindow *Yagy)
    {
        Yagy->setWindowTitle(QApplication::translate("MainWindow", "Yagy", 0));
        actionNew->setText(QApplication::translate("MainWindow", "New", 0));
        actionNew->setShortcut(QApplication::translate("MainWindow", "Ctrl+N", 0));
        actionOpen->setText(QApplication::translate("MainWindow", "Open", 0));
        actionOpen->setShortcut(QApplication::translate("MainWindow", "Ctrl+O", 0));
        actionSave->setText(QApplication::translate("MainWindow", "Save", 0));
        actionSave->setShortcut(QApplication::translate("MainWindow", "Ctrl+S", 0));
        toolBar->setWindowTitle(QApplication::translate("MainWindow", "toolBar", 0));
    } // retranslateUi

};

namespace Ui {
    class MainWindow: public Ui_MainWindow {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_MAINWINDOW_H
