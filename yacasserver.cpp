#include "yacasserver.h"

#include <QMutexLocker>

YacasServer::YacasServer(QObject *parent) :
    QObject(parent)
{
    _requests.shutdown = false;

    YacasEngine* engine = new YacasEngine(_requests);
    engine->moveToThread(&_engine_thread);
    _engine_thread.start();
    connect(&_engine_thread, SIGNAL(finished()), engine, SLOT(deleteLater()));
    connect(this, SIGNAL(start_processing()), engine, SLOT(on_start_processing()));

    emit start_processing();
}

YacasServer::~YacasServer()
{
    _requests.shutdown = true;
    _requests.cnd.wakeAll();

    _engine_thread.quit();
    _engine_thread.wait();
}

void YacasServer::submit(YacasRequest* request)
{
    QMutexLocker lock(&_requests.mtx);
    _requests.waiting.enqueue(request);
    _requests.cnd.wakeAll();
}
