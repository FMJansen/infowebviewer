from flask import Flask
import settings

app = Flask('infowebviewer')
app.config.from_object('infowebviewer.settings')

import views
