#include "config.h"
#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QtCore/QFile>
#include <QtWebKitWidgets/QWebPage>
#include <QtWebKitWidgets/QWebFrame>
#include <QtWidgets/QFileDialog>

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#endif

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow),
    yacas(new CYacas(new StringOutput(side_effects))),
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

    yacas->Evaluate("Plot2D'outputs();");
    
    yacas->Evaluate("Plot2D'yagy(values_IsList, _options'hash) <-- Yagy'Plot2D'Data(values);");
    yacas->Evaluate("Plot2D'outputs() := { {\"default\", \"yagy\"}, {\"data\", \"Plot2D'data\"}, {\"gnuplot\", \"Plot2D'gnuplot\"}, {\"java\", \"Plot2D'java\"}, {\"yagy\", \"Plot2D'yagy\"}, };");
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


void MainWindow::on_actionNew_triggered()
{
    loadYacasPage();
}

void MainWindow::on_actionOpen_triggered()
{
    QString fname =
            QFileDialog::getOpenFileName(this, "Open", "", "Yacas files (*.ys);;All files (*)");

    if (fname.length() != 0) {
        setWindowTitle(QFileInfo(fname).baseName() + " - Yagy");
    }
}

void MainWindow::on_actionSave_triggered()
{
    QString fname =
            QFileDialog::getSaveFileName(this, "Save", "", "Yacas files (*.ys);;All files (*)");

    if (fname.length() != 0) {
        setWindowTitle(QFileInfo(fname).baseName() + " - Yagy");
    }
}

QVariantMap MainWindow::eval(QString expr)
{
    QVariantMap evaluation_result;
    
    evaluation_result["input"] = expr;
    
    side_effects = "";
    
    yacas->Evaluate(QString(expr + ";").toStdString().c_str());
    
    if (!QString(side_effects.c_str()).trimmed().isEmpty())
        evaluation_result["side_effects"] = side_effects.c_str();
    
    if (!yacas->IsError()) {
        QString result = yacas->Result();
        result = result.trimmed();
        result = result.left(result.length() - 1);

        if (result.startsWith("Yagy'Plot2D'Data")) {
            result = result.remove("Yagy'Plot2D'Data(");
            result = result.remove(")");
            result = result.remove("{{{");
            result = result.remove("}}}");
            
            QList<QVariant> data;
            
            foreach (const QString& ps, result.split("}},{{")) {
                QList<QVariant> partial_data;

                foreach (const QString& ss, ps.split("},{")) {
                    QList<QVariant> p;
                    foreach (const QString& s, ss.split(",")) {
                        p.append(s.toDouble());
                    }
                    partial_data.append(QVariant(p));
                }
                data.append(QVariant(partial_data));
            }
            
            evaluation_result["type"] = "Plot2D";
            evaluation_result["plot2d_data"] = data;
        } else {
            const QString texform_expr = QString("TeXForm(Hold(") + result.trimmed() + "));";
            yacas2tex->Evaluate(texform_expr.toStdString().c_str());
            const QString texform_result = yacas2tex->Result();
            const QString tex_code =
                texform_result.trimmed().mid(2, texform_result.length() - 5);
            evaluation_result["type"] = "Expression";
            evaluation_result["expression"] = result;
            evaluation_result["tex_code"] = tex_code;
        }
    } else {
        evaluation_result["type"] = "Error";
        evaluation_result["error_message"] = yacas->Error();
    }
    
    return evaluation_result;
}
