from google.appengine.ext import ndb

class User(ndb.Model):
    ref = ndb.IntegerProperty(indexed=False)
    llnr = ndb.StringProperty(indexed=True)
    name = ndb.StringProperty(indexed=True)
    group = ndb.StringProperty(indexed=False)
