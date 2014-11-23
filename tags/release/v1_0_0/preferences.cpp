#include "preferences.h"

#if defined(__APPLE__)
#include <CoreFoundation/CoreFoundation.h>
#elif defined(_WIN32)
#include <shlwapi.h>
#endif

#include <QtCore/QDir>

Preferences::Preferences(const QApplication& app)
{
#if defined(__APPLE__)

    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFURLRef frameworkURL = CFBundleCopySharedFrameworksURL (mainBundle);
    char path[PATH_MAX];
    if (!CFURLGetFileSystemRepresentation(frameworkURL, TRUE, (UInt8 *)path, PATH_MAX))
        throw std::runtime_error("Failed to find resources, bailing out.");

    _default_scripts_path = path;
    _default_scripts_path.append("/yacas.framework/Versions/Current/Resources/scripts/");
#elif defined(_WIN32)
    char root_dir_buf[MAX_PATH];
    LSTATUS status = SHRegGetPathA(HKEY_LOCAL_MACHINE, "SOFTWARE\\yagy\\yagy", 0, root_dir_buf, 0);
    if (status != ERROR_SUCCESS)
        throw std::runtime_error("Failed to read registry, bailing out.");
    std::strcat(root_dir_buf, "\\share\\yagy\\scripts\\");
    for (char* p = root_dir_buf; *p; ++p)
        if (*p == '\\')
            *p = '/';
    
    _default_scripts_path = root_dir_buf;
#else
    QDir dir(app.applicationDirPath());
    dir.cd("../share/yagy/scripts");
    _default_scripts_path = dir.canonicalPath() + "/";
#endif
}

bool Preferences::get_enable_toolbar() const
{
    return _settings.value("View/enable_toolbar", true).toBool();
}

void Preferences::set_enable_toolbar(bool state)
{
    if (_settings.value("View/enable_toolbar", true).toBool() != state) {
        _settings.setValue("View/enable_toolbar", state);
        emit changed();
    }
}

unsigned Preferences::get_math_font_scale() const
{
    return _settings.value("View/math_font_scale", 100u).toUInt();
}

void Preferences::set_math_font_scale(unsigned scale)
{
    if (_settings.value("View/math_font_scale", 100u).toUInt() != scale) {
        _settings.setValue("View/math_font_scale", scale);
        emit changed();
    }
}

QString Preferences::get_math_font() const
{
    return _settings.value("View/math_font", "Default").toString();
}

void Preferences::set_math_font(const QString& font)
{
    if (_settings.value("View/math_font", "Default").toString() != font) {
        _settings.setValue("View/math_font", font);
        emit changed();
    }    
}

bool Preferences::get_scripts_path_default() const
{
    return _settings.value("Engine/scripts_path_default", true).toBool();
}

void Preferences::set_scripts_path_default(bool state)
{
    if (_settings.value("Engine/scripts_path_default", true).toBool() != state) {
        _settings.setValue("Engine/scripts_path_default", state);
        emit changed();
    }
}

QString Preferences::get_default_scripts_path() const
{
    return _default_scripts_path;
}

QString Preferences::get_custom_scripts_path() const
{
    return _settings.value("Engine/custom_scripts_path", "").toString();
}

void Preferences::set_custom_scripts_path(const QString& path)
{
    if (_settings.value("Engine/custom_scripts_path", "").toString() != path) {
        _settings.setValue("Engine/custom_scripts_path", path);
        emit changed();
    }
}

QString Preferences::get_scripts_path() const
{
    if (get_scripts_path_default())
       return get_default_scripts_path();
    
    return get_custom_scripts_path();
}

QString Preferences::get_cwd() const
{
    return _settings.value("working_directory", QDir::homePath()).toString();
}

void Preferences::set_cwd(const QString& cwd)
{
    if (get_cwd() != cwd) {
        _settings.setValue("working_directory", cwd);
        emit changed();
    }
}

bool Preferences::get_enable_WebGL() const
{
    return _settings.value("View/enable_WebGL", true).toBool();
}
void Preferences::set_enable_WebGL(bool state)
{
 
    if (_settings.value("View/enable_WebGL", true).toBool() != state) {
        _settings.setValue("View/enable_WebGL", state);
        emit changed();
    }

}

