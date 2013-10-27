from google.appengine.ext import ndb
from models import User

results = User.query().fetch()

memory_db = {}
i = 0

for user in results:
    new_user = { 'ref': user.ref,
                 'llnr': user.llnr,
                 'name': user.name,
                 'group': user.group }

    memory_db[i] = new_user
    i = i + 1
