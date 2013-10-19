from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ref = db.Column(db.Integer(1), unique=False)
    llnr = db.Column(db.String(8), unique=True)
    name = db.Column(db.String(255), unique=False)
    group = db.Column(db.String(6), unique=False)

    def __init__(self, ref, llnr, name, group):
        self.ref = ref
        self.llnr = llnr
        self.name = name
        self.group = group

    def __repr__(self):
        return '%r (%s, %s)' % (self.name, self.llnr, self.group)
