#ifndef YACASSERVER_H
#define YACASSERVER_H

#include <QObject>
#include <QThread>

#include "yacasengine.h"

class YacasServer: public QObject
{
    Q_OBJECT
public:
    explicit YacasServer(QObject* parent = 0);
    ~YacasServer();

    void submit(YacasRequest*);

signals:
    void start_processing();

public slots:

private:
    YacasRequestQueue _requests;
    QThread _engine_thread;
};

#endif
