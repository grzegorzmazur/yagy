#ifndef YACASENGINE_H
#define YACASENGINE_H

#include <QObject>

#include <QMutex>
#include <QQueue>
#include <QWaitCondition>

#include "yacasrequest.h"

#include "yacas/yacas.h"

struct YacasRequestQueue {
    QMutex mtx;
    QWaitCondition cnd;
    QQueue<YacasRequest*> waiting;
    bool shutdown;
};

class YacasEngine: public QObject
{
    Q_OBJECT
public:
    explicit YacasEngine(YacasRequestQueue& requests, QObject* = 0);
    ~YacasEngine();

public slots:
    void on_start_processing();

private:
    YacasRequestQueue& _requests;
    CYacas* _yacas;
    LispString _side_effects;
    unsigned _idx;
};

#endif // YACASENGINE_H
