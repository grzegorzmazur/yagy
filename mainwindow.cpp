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
    
    yacas->Evaluate("Plot2D'yagy(values_IsList, _options'hash) <-- Yagy'Plot2D'Data(values, options'hash);");
    yacas->Evaluate("Plot2D'outputs() := { {\"default\", \"yagy\"}, {\"data\", \"Plot2D'data\"}, {\"gnuplot\", \"Plot2D'gnuplot\"}, {\"java\", \"Plot2D'java\"}, {\"yagy\", \"Plot2D'yagy\"}, };");
    
    yacas->Evaluate("Plot3DS'outputs();");
    yacas->Evaluate("Plot3DS'yagy(values_IsList, _options'hash) <-- Yagy'Plot3DS'Data(values, options'hash);");
    yacas->Evaluate("Plot3DS'outputs() := { {\"default\", \"yagy\"}, {\"data\", \"Plot3DS'data\"}, {\"gnuplot\", \"Plot3DS'gnuplot\"}, {\"yagy\", \"Plot3DS'yagy\"},};");

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
            result.truncate(result.length() - 1);
            
            QList<QVariant> data;
            
            QStringList parts = result.split("}},{{");
            
            QString options_string = parts.takeLast().trimmed();
            options_string.truncate(options_string.length() - 2);
            
            QRegExp dict_entry_rx("(\"[^\"]+\"),(.+)");
            QRegExp number_list_rx("\\{([^,\\}]+)(?:,([^,\\}]+))*\\}");
            QRegExp string_list_rx("\\{(?:\"([^\"]+)\")(?:,\"([^\"]+)\")*\\}");
            
            QStringList labels;
            
            foreach (QString os, options_string.split("},{")) {

                dict_entry_rx.exactMatch(os);
                
                if (dict_entry_rx.cap(1) == "\"xrange\"") {
                    number_list_rx.exactMatch(dict_entry_rx.cap(2));
                }
                
                if (dict_entry_rx.cap(1) == "\"yname\"") {
                    string_list_rx.exactMatch(dict_entry_rx.cap(2));
                    for (int i = 1; i <= string_list_rx.captureCount(); ++i)
                        labels.append(string_list_rx.cap(i));
                }
            }
            
            parts = parts.replaceInStrings("{{{", "");
            parts = parts.replaceInStrings("}}}", "");
            
            for (int i = 0; i < parts.size(); ++i) {

                QList<QVariant> partial_data;

                foreach (const QString& ss, parts[i].split("},{")) {
                    QList<QVariant> p;
                    foreach (QString s, ss.split(",")) {
                        p.append(s.replace("{", "").replace("}","").toDouble());
                    }
                    partial_data.append(QVariant(p));
                }
                
                QVariantMap data_entry;
                data_entry["label"] = labels[i];
                data_entry["data"] = partial_data;
                data.append(data_entry);
                //data.append(QVariant(partial_data));
            }
            
            evaluation_result["type"] = "Plot2D";
            evaluation_result["plot2d_data"] = data;
            
        } else if (result.startsWith("Yagy'Plot3DS'Data")) {
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
