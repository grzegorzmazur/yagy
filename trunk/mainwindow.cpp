#include "config.h"
#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QtCore/QFile>
#include <QtWebKitWidgets/QWebPage>
#include <QtWebKitWidgets/QWebFrame>

#include "yacas/yacas.h"

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#endif

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow),
    yacas(new CYacas),
    yacas2tex(new CYacas)
{
#ifdef __APPLE__
    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFURLRef frameworkURL = CFBundleCopySharedFrameworksURL (mainBundle);
    char path[PATH_MAX];
    if (!CFURLGetFileSystemRepresentation(frameworkURL, TRUE, (UInt8 *)path, PATH_MAX))
    {
        qDebug() << "Error finding Resources URL";
    }

    yacas->Evaluate((std::string("DefaultDirectory(\"") + std::string(path) + std::string("/yacas.framework/Versions/Current/Resources/scripts/\");")).c_str());
    yacas2tex->Evaluate((std::string("DefaultDirectory(\"") + std::string(path) + std::string("/yacas.framework/Versions/Current/Resources/scripts/\");")).c_str());
    
#else
    yacas->Evaluate((std::string("DefaultDirectory(\"") + std::string(YACAS_PREFIX) + std::string("/share/yacas/scripts/\");")).c_str());
    yacas2tex->Evaluate((std::string("DefaultDirectory(\"") + std::string(YACAS_PREFIX) + std::string("/share/yacas/scripts/\");")).c_str());
#endif
    
    yacas->Evaluate("Load(\"yacasinit.ys\");");
    yacas2tex->Evaluate("Load(\"yacasinit.ys\");");
    
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
    char path[] = YAGY_RESOURCES_PATH;
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

    connect(ui->webView->page()->currentFrame(), SIGNAL(javaScriptWindowObjectCleared()), this, SLOT(initObjectMapping()));
    ui->webView->setHtml( mText, QUrl("file://"+ resourcesPath + "/")) ;
    ui->webView->page()->currentFrame()->setScrollBarPolicy(Qt::Vertical, Qt::ScrollBarAlwaysOn);
}

void MainWindow::initObjectMapping()
{
    ui->webView->page()->currentFrame()->addToJavaScriptWindowObject("yacas", this);
}

MainWindow::~MainWindow()
{
    delete ui;
}

QString MainWindow::eval(QString expr)
{
    yacas->Evaluate(QString(expr + ";").toStdString().c_str());
    
    if (!yacas->IsError()) {
        QString result = yacas->Result();
        result = result.left(result.length() - 1);
        const QString texform_expr = QString("TeXForm(Hold(") + result.trimmed() + "));";
        yacas2tex->Evaluate(texform_expr.toStdString().c_str());
        const QString texform_result = yacas2tex->Result();
        const QString tex_code =
            texform_result.trimmed().mid(2, texform_result.length() - 5);
        return tex_code;
    } else {
        return "error";
    }
}
