#include "yacasengine.h"

#include <QMutexLocker>

#ifdef __APPLE__
#include <CoreFoundation/CoreFoundation.h>
#endif

#include "config.h"

YacasEngine::YacasEngine(YacasRequestQueue& requests, QObject* parent):
    QObject(parent),
    _requests(requests),
    _yacas(new CYacas(new StringOutput(_side_effects))),
    _idx(1)
{
#ifdef __APPLE__
    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFURLRef frameworkURL = CFBundleCopySharedFrameworksURL (mainBundle);
    char path[PATH_MAX];
    if (!CFURLGetFileSystemRepresentation(frameworkURL, TRUE, (UInt8 *)path, PATH_MAX))
    {
        qDebug() << "Error finding Resources URL";
    }

    _yacas->Evaluate((std::string("DefaultDirectory(\"") + std::string(path) + std::string("/yacas.framework/Versions/Current/Resources/scripts/\");")).c_str());
#else
    _yacas->Evaluate((std::string("DefaultDirectory(\"") + std::string(YACAS_PREFIX) + std::string("/share/yacas/scripts/\");")).c_str());
#endif
    _yacas->Evaluate("Load(\"yacasinit.ys\");");

    _yacas->Evaluate("Plot2D'outputs();");
    
    _yacas->Evaluate("Plot2D'yagy(values_IsList, _options'hash) <-- Yagy'Plot2D'Data(values, options'hash);");
    _yacas->Evaluate("Plot2D'outputs() := { {\"default\", \"yagy\"}, {\"data\", \"Plot2D'data\"}, {\"gnuplot\", \"Plot2D'gnuplot\"}, {\"java\", \"Plot2D'java\"}, {\"yagy\", \"Plot2D'yagy\"}, };");
    
    _yacas->Evaluate("Plot3DS'outputs();");
    _yacas->Evaluate("Plot3DS'yagy(values_IsList, _options'hash) <-- Yagy'Plot3DS'Data(values, options'hash);");
    _yacas->Evaluate("Plot3DS'outputs() := { {\"default\", \"yagy\"}, {\"data\", \"Plot3DS'data\"}, {\"gnuplot\", \"Plot3DS'gnuplot\"}, {\"yagy\", \"Plot3DS'yagy\"},};");
}

YacasEngine::~YacasEngine()
{
    delete _yacas;
}

void YacasEngine::on_start_processing()
{
    for (;;) {

        QMutexLocker lock(&_requests.mtx);

        if (_requests.shutdown)
            return;

        _requests.cnd.wait(&_requests.mtx);

        if (_requests.shutdown)
            return;

        while (!_requests.waiting.empty()) {
            YacasRequest* request = _requests.waiting.dequeue();

            // Beware of low flying butterflies
            _requests.mtx.unlock();

            const QString expr = request->take();

            _side_effects = "";
            _yacas->Evaluate((expr + ";").toStdString().c_str());

            if (!_yacas->IsError()) {
                QString result = _yacas->Result();
                result = result.left(result.length() - 1).trimmed();
                
                YacasRequest::ResultType result_type = YacasRequest::EXPRESSION;
                if (result.startsWith("Yagy'Plot2D'Data")) {
                    result_type = YacasRequest::PLOT2D;
                    result = result.remove("Yagy'Plot2D'Data(");
                    result.truncate(result.length() - 1);
                } else if (result.startsWith("Yagy'Plot3DS'Data"))
                    result_type = YacasRequest::PLOT3D;

                request->answer(_idx++, result_type, result, QString(_side_effects.c_str()));
            } else {
                QString msg = _yacas->Error();
                request->answer(_idx++, YacasRequest::ERROR, msg.trimmed(), QString(_side_effects.c_str()));
            }

            _requests.mtx.lock();
        }
    }
}