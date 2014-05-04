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

#include "yacas/yacas_version.h"

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#endif

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow),
    _yacas_server(new YacasServer),
    _has_file(false),
    _modified(false),
    _fname(QString("Untitled Notebook ") + QString::number(_cntr++))
{
#ifdef __APPLE__

    QApplication::instance()->setAttribute(Qt::AA_DontShowIconsInMenus);
    
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
    
    ui->toolBar->setIconSize(QSize(20, 20));
    
    _update_title();
    
    loadYacasPage();
    
    _windows.append(this);
}

MainWindow::~MainWindow()
{
    _windows.removeOne(this);
    
    delete _yacas_server;
    delete ui;
}

void MainWindow::closeEvent(QCloseEvent* event)
{
    if (!_modified) {
        event->accept();
    } else {
        const QMessageBox::StandardButton reply = 
            QMessageBox::question(this, "Save notebook?", "Save changes before closing?\n\nYour changes will be lost if you don't save them.",
                                QMessageBox::Save | QMessageBox::Cancel | QMessageBox::Close);
        
        if (reply == QMessageBox::Save)
            on_action_Save_triggered();
        
        if (reply == QMessageBox::Cancel)
            event->ignore();
        else
            event->accept();
    }
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
    connect(ui->webView->page(), SIGNAL(contentsChanged()), this, SLOT(on_contentsChanged()));
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
    MainWindow* w = new MainWindow();

    w->show();
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

    _fname = fname;
    _modified = false;
    _has_file = true;
    _update_title();
}

void MainWindow::on_action_Save_triggered()
{
    if (!_has_file)
        on_action_Save_As_triggered();
    else
        _save();
}

void MainWindow::on_action_Save_As_triggered()
{
    QString fname =
            QFileDialog::getSaveFileName(this, "Save", "", "Yagy files (*.ygy);;All files (*)");

    if (fname.length() == 0)
        return;

    if (QFileInfo(fname).suffix() == "")
        fname += ".ygy";
    
    _fname = fname;
    
    _save();
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

void MainWindow::on_action_Close_triggered()
{
    close();
}

void MainWindow::on_action_Quit_triggered()
{
    foreach (MainWindow* w, _windows)
        w->close();
}

void MainWindow::on_action_Copy_triggered()
{
}

void MainWindow::on_action_Paste_triggered()
{
}

void MainWindow::on_action_Use_triggered()
{
    QString fname =
            QFileDialog::getOpenFileName(this, "Open", "", "Yacas scripts (*.ys);;All files (*)");

    if (fname.length() == 0)
        return;

    QFile f(fname);

    if (!f.open(QIODevice::ReadOnly)) {
        qWarning("Couldn't open file for loading.");
        return;
    }
    
    QByteArray data = f.readAll();
}

void MainWindow::on_action_Load_triggered()
{
    QString fname =
            QFileDialog::getOpenFileName(this, "Open", "", "Yacas scripts (*.ys);;All files (*)");

    if (fname.length() == 0)
        return;

    QFile f(fname);

    if (!f.open(QIODevice::ReadOnly)) {
        qWarning("Couldn't open file for loading.");
        return;
    }
    
    QByteArray data = f.readAll();
}

void MainWindow::on_action_Import_triggered()
{
    QString fname =
            QFileDialog::getOpenFileName(this, "Open", "", "Yacas scripts (*.ys);;All files (*)");

    if (fname.length() == 0)
        return;

    QFile f(fname);

    if (!f.open(QIODevice::ReadOnly)) {
        qWarning("Couldn't open file for loading.");
        return;
    }
    
    QByteArray data = f.readAll();
}

void MainWindow::on_action_Export_triggered()
{
    QString fname =
            QFileDialog::getSaveFileName(this, "Open", "", "Yacas scripts (*.ys);;All files (*)");

    if (fname.length() == 0)
        return;

    QFile f(fname);

    if (!f.open(QIODevice::WriteOnly)) {
        qWarning("Couldn't open file for saving.");
        return;
    }

    const QWebElementCollection c = ui->webView->page()->currentFrame()->findAllElements(".editable");

    foreach (const QWebElement& e, c) {
        const QString s = e.toPlainText().trimmed();
        f.write(s.toLatin1());
        if (!s.endsWith(";"))
            f.write(";");
        f.write("\n");
    }
}

void MainWindow::on_actionEvaluate_Current_triggered()
{
    ui->webView->page()->currentFrame()->evaluateJavaScript(QString("evaluateCurrent()"));
}

void MainWindow::on_actionEvaluate_All_triggered()
{
    ui->webView->page()->currentFrame()->evaluateJavaScript(QString("evaluateAll()"));

}

void MainWindow::on_action_Interrupt_triggered()
{
    _yacas_server->cancel();
}

void MainWindow::on_action_Restart_triggered()
{
    const QMessageBox::StandardButton reply =
        QMessageBox::question(this, "Restart", "Restart Yacas?",
                              QMessageBox::Yes|QMessageBox::No);
    
    if (reply == QMessageBox::Yes) {
        delete _yacas_server;
        _yacas_server = new YacasServer;
    }
}

void MainWindow::on_actionYacas_Manual_triggered()
{
    QDesktopServices::openUrl(QUrl("http://yacas.sourceforge.net/refmanual.html"));
}

void MainWindow::on_action_About_triggered()
{
    QString about = 
        "Yet Another Gui for Yacas\n"
        "\n"
        "Powered by Yacas version %1";
    
    
    
    QMessageBox::about(this, "About Yagy", about.arg(YACAS_VERSION));
}

void MainWindow::eval(int idx, QString expr)
{
    new CellProxy(ui->webView->page()->currentFrame(), idx, expr, *_yacas_server, _yacas2tex);
    
    if (!_modified) {
        _modified = true;
        _update_title();
    }
}

void MainWindow::help(QString s, int cp)
{
    if (s.length() == 0)
        return;
    
    if (cp >= s.length())
        cp = s.length() - 1;
    
    int b = QRegExp("[^a-zA-Z']").lastIndexIn(s, cp);
    if (b == cp && cp > 0)
        b = QRegExp("[^a-zA-Z']").lastIndexIn(s, cp - 1);
    
    if (b == -1)
        b = 0;

    QRegExp word_rx("[a-zA-Z']+");
    
    if (word_rx.indexIn(s, b) == -1)
        return;
    
    const QString key = word_rx.cap(0);
    const QString ref = QString("http://yacas.sourceforge.net/ref.html?") + key;
    
    QDesktopServices::openUrl(QUrl(ref));
}

void MainWindow::on_contentsChanged()
{
    if (!_modified) {
        _modified = true;
        _update_title();
    }
}

void MainWindow::_save()
{
    QFile f(_fname);

    if (!f.open(QIODevice::WriteOnly)) {
        qWarning("Couldn't open file for saving.");
        return;
    }

    QVariant v = ui->webView->page()->currentFrame()->evaluateJavaScript("getAllInputs()");

    QJsonArray j;
    foreach (const QVariant e, v.toList()) {
        QJsonObject o;
        o["input"] = e.toString();
        j.push_back(o);
    }

    QJsonDocument d(j);

    f.write(d.toJson());
    
    _modified = false;
    _has_file = true;
    _update_title();
}

void MainWindow::_update_title()
{
    QString title = QFileInfo(_fname).baseName();
    
    if (_modified)
        title = "*" + title;
    
    title += " - Yagy";
    
    setWindowTitle(title);
    
    ui->action_Save->setEnabled(_modified);
}

QList<MainWindow*> MainWindow::_windows;
unsigned MainWindow::_cntr = 1;