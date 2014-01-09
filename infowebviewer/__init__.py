from flask import Flask

app = Flask('infowebviewer')

from infowebviewer.db_in_memory import db

import views
