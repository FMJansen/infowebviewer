import db_updater
students = db_updater.get_students(db_updater.get_groups())
teachers = db_updater.get_teachers()
classrooms = db_updater.get_classrooms()

db = {}
i = 0

for user in students:
    new_user = { 'ref': user['ref'],
                 'llnr': user['llnr'],
                 'name': user['name'],
                 'group': user['group'] }

    db[i] = new_user
    i = i + 1

for user in teachers:
    new_user = { 'ref': user['ref'],
                 'llnr': user['llnr'],
                 'name': user['name'],
                 'group': user['group'] }

    db[i] = new_user
    i = i + 1

for user in classrooms:
    new_user = { 'ref': user['ref'],
                 'llnr': user['llnr'],
                 'name': user['name'],
                 'group': user['group'] }

    db[i] = new_user
    i = i + 1