#ifndef PREFERENCES_H
#define	PREFERENCES_H

#include <QtCore/QSettings>

class Preferences: public QObject {
    
    Q_OBJECT
            
public:
    Preferences();
    
    bool get_enable_toolbar() const;
    void set_enable_toolbar(bool);

    unsigned get_math_font_scale() const;
    void set_math_font_scale(unsigned);
    
    QString get_math_font() const;
    void set_math_font(const QString&);
    
    bool get_scripts_path_default() const;
    void set_scripts_path_default(bool);
    
    QString get_default_scripts_path() const;
    
    QString get_custom_scripts_path() const;
    void set_custom_scripts_path(const QString&);
    
    QString get_scripts_path() const;

signals:
    void changed();
    
private:
    QSettings _settings;
    QString _default_scripts_path;
};

#endif	/* PREFERENCES_H */

