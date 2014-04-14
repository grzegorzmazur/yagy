#include "yacasengine.h"

#include <QMutexLocker>


YacasEngine::YacasEngine(YacasRequestQueue& requests, QObject* parent):
    QObject(parent),
    _requests(requests),
    _yacas(new CYacas(new StringOutput(_side_effects))),
    _idx(1)
{
    _yacas->Evaluate("DefaultDirectory(\"/home/mazur/work/yacas/trunk-root/share/yacas/scripts/\");");
    _yacas->Evaluate("Load(\"yacasinit.ys\");");
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
                result = result.left(result.length() - 1);
                request->answer(_idx++, YacasRequest::EXPRESSION, result.trimmed(), QString(_side_effects.c_str()));
            } else {
                QString msg = _yacas->Error();
                request->answer(_idx++, YacasRequest::ERROR, msg.trimmed(), QString(_side_effects.c_str()));
            }

            _requests.mtx.lock();
        }
    }
}
