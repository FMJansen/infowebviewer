from flask import Flask

app = Flask('infowebviewer')

import db_in_memory

import views
