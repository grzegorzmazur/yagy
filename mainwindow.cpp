#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QtWebKitWidgets/QWebPage>
#include <QtWebKitWidgets/QWebFrame>
#include <QFile>

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#endif

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{

    ui->setupUi(this);
    loadYacasPage();
    setUnifiedTitleAndToolBarOnMac(true);
}

void MainWindow::loadYacasPage()
{
#ifdef __APPLE__
    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFURLRef resourcesURL = CFBundleCopyResourcesDirectoryURL(mainBundle);

    char path[PATH_MAX];
    if (!CFURLGetFileSystemRepresentation(resourcesURL, TRUE, (UInt8 *)path, PATH_MAX))
    {
        qDebug() << "Error finding Resources URL";
    }
#else
    char path[] = "/usr/local/share/yagy";
#endif
    
    QString resourcesPath( path );
    
    QFile mFile(":/resources/view.html");
    
    if(!mFile.open(QFile::ReadOnly | QFile::Text)){
        qDebug() << "could not open file for read (view.html)";
        return;
    }
    
    QTextStream in(&mFile);
    QString mText = in.readAll();
    mFile.close();

    ui->webView->setHtml( mText, QUrl("file://"+ resourcesPath + "/")) ;
}

MainWindow::~MainWindow()
{
    delete ui;
}

void
MainWindow::changeEvent(QEvent *e)
{
    QMainWindow::changeEvent(e);
    switch (e->type()) {
        case QEvent::LanguageChange:
            ui->retranslateUi(this);
            break;
        default:
            break;
    }
}
