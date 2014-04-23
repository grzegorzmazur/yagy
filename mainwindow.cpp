#include "config.h"
#include "mainwindow.h"
#include "ui_mainwindow.h"
#include "cellproxy.h"

#include <QtCore/QDebug>
#include <QtCore/QJsonArray>
#include <QtCore/QJsonDocument>
#include <QtCore/QJsonObject>
#include <QtCore/QFile>
#include <QtCore/QList>
#include <QtCore/QUrl>
#include <QtCore/QVariant>
#include <QtGui/QDesktopServices>
#include <QtWebKit/QWebElement>
#include <QtWebKit/QWebElementCollection>
#include <QtWebKitWidgets/QWebPage>
#include <QtWebKitWidgets/QWebFrame>
#include <QtWidgets/QFileDialog>
#include <QtWidgets/QMessageBox>
#include <QtPrintSupport/QPrintDialog>

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#endif

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
#ifdef __APPLE__
    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFURLRef frameworkURL = CFBundleCopySharedFrameworksURL (mainBundle);
    char path[PATH_MAX];
    if (!CFURLGetFileSystemRepresentation(frameworkURL, TRUE, (UInt8 *)path, PATH_MAX))
    {
        qDebug() << "Error finding Resources URL";
    }

    _yacas2tex.Evaluate((std::string("DefaultDirectory(\"") + std::string(path) + std::string("/yacas.framework/Versions/Current/Resources/scripts/\");")).c_str());
#else
    _yacas2tex.Evaluate((std::string("DefaultDirectory(\"") + std::string(YACAS_PREFIX) + std::string("/share/yacas/scripts/\");")).c_str());
#endif
    
    _yacas2tex.Evaluate("Load(\"yacasinit.ys\");");

    ui->setupUi(this);
    loadYacasPage();
    setUnifiedTitleAndToolBarOnMac(true);
}

MainWindow::~MainWindow()
{
    delete ui;
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
    const QUrl resource_url = QUrl(QString("file:///") + QString(path) + QString("/"));
#else
    const QUrl resource_url = QUrl("qrc:///");
#endif
    
    QFile mFile(":/resources/view.html");
    
    if(!mFile.open(QFile::ReadOnly | QFile::Text)){
        qDebug() << "could not open file for read (view.html)";
        return;
    }
    
    QTextStream in(&mFile);
    QString mText = in.readAll();
    mFile.close();

    connect(ui->webView->page()->currentFrame(), SIGNAL(javaScriptWindowObjectCleared()), this, SLOT(initObjectMapping()));
    ui->webView->setHtml( mText, resource_url) ;
    ui->webView->page()->currentFrame()->setScrollBarPolicy(Qt::Vertical, Qt::ScrollBarAlwaysOn);
}

void MainWindow::initObjectMapping()
{
    ui->webView->page()->currentFrame()->addToJavaScriptWindowObject("yacas", this);
}

void MainWindow::print(QPrinter* printer)
{
    ui->webView->print(printer);
}


void MainWindow::on_action_New_triggered()
{
    loadYacasPage();
}

void MainWindow::on_action_Open_triggered()
{
    QString fname =
            QFileDialog::getOpenFileName(this, "Open", "", "Yagy files (*.ygy);;All files (*)");

    if (fname.length() == 0)
        return;

    QFile f(fname);

    if (!f.open(QIODevice::ReadOnly)) {
        qWarning("Couldn't open file for loading.");
        return;
    }
    
    QByteArray data = f.readAll();

    loadYacasPage();
        
    foreach (const QJsonValue& v, QJsonDocument::fromJson(data).array())
        ui->webView->page()->currentFrame()->evaluateJavaScript(QString("calculate('") + v.toObject()["input"].toString() + "');");
    
    setWindowTitle(QFileInfo(fname).baseName() + " - Yagy");
}

void MainWindow::on_action_Save_triggered()
{
    on_action_Save_As_triggered();
}

void MainWindow::on_action_Save_As_triggered()
{
    QString fname =
            QFileDialog::getSaveFileName(this, "Save", "", "Yagy files (*.ygy);;All files (*)");

    if (fname.length() == 0)
        return;

    if (QFileInfo(fname).suffix() == "")
        fname += ".ygy";
    
    QFile f(fname);

    if (!f.open(QIODevice::WriteOnly)) {
        qWarning("Couldn't open file for saving.");
        return;
    }

    const QWebElementCollection c = ui->webView->page()->currentFrame()->findAllElements(".editable");
    QJsonArray j;
    foreach (const QWebElement& e, c) {
        QJsonObject o;
        o["input"] = e.toPlainText();
        j.push_back(o);
    }
    
    QJsonDocument d(j);

    f.write(d.toJson());
    
    setWindowTitle(QFileInfo(fname).baseName() + " - Yagy");

}

void MainWindow::on_action_Print_triggered()
{
    if (!_printer)
        _printer.reset(new QPrinter);

    QScopedPointer<QPrintDialog> d(new QPrintDialog(_printer.data(), this));
    d->setAttribute(Qt::WA_DeleteOnClose);
    connect(d.data(), SIGNAL(accepted(QPrinter*)), SLOT(print(QPrinter*)));
    d->show();
    d.take();
}

void MainWindow::on_action_Quit_triggered()
{
    QApplication::quit();
}

void MainWindow::on_actionYacas_Manual_triggered()
{
    QDesktopServices::openUrl(QUrl("http://yacas.sourceforge.net/refmanual.html"));
}

void MainWindow::on_action_About_triggered()
{
    QMessageBox::about(this, "About Yagy", "Yet Another Gui for Yacas");
}


void MainWindow::eval(int idx, QString expr)
{
    new CellProxy(ui->webView->page()->currentFrame(), idx, expr, _yacas_server, _yacas2tex);
}
