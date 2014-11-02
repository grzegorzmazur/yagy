#include "preferences_dialog.h"

#include "ui_preferences.h"

PreferencesDialog::PreferencesDialog(QWidget* parent):
    QDialog(parent)
{
    Ui::Preferences preferences_ui;
    preferences_ui.setupUi(this);

}
