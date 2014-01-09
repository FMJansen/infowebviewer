import datetime
import requests
from bs4 import BeautifulSoup

week_n = str(datetime.date.today().isocalendar()[1])
base_url = 'http://www.cygnusgymnasium.nl/ftp_cg/roosters/infoweb/'

cookie_url = '{0}index.php'.format(base_url)
r = requests.get(cookie_url)
cookies = r.cookies



def get_groups():
    group_url = '{0}selectie.inc.php?wat=week&weeknummer={1}'.format(base_url, week_n)
    group_result = requests.get(group_url, cookies=cookies)
    group_soup = BeautifulSoup(group_result.text)
    group_options = group_soup.find_all('option')

    groups = []

    for option in group_options:
        group = option.string
        if group.isalnum():
            groups.append(group)

    return groups



def get_students(groups):
    students = []

    for group in groups:
        student_url = '{0}selectie.inc.php?wat=groep&weeknummer={1}&groep={2}'.format(base_url, week_n, group)
        student_result = requests.get(student_url, cookies=cookies)
        student_soup = BeautifulSoup(student_result.text)
        student_options = student_soup.find_all('option')

        for option in student_options:
            llnr = option['value']

            if llnr.isalnum():
                name = option.string

                new_user = { 'ref': 2,
                             'llnr': llnr,
                             'name': name,
                             'group': group }
                students.append(new_user)

    return students



def get_teachers():
    teacher_url = '{0}selectie.inc.php?wat=groep&weeknummer={1}&groep=*allen&type=1'.format(base_url, week_n)
    teacher_result = requests.get(teacher_url, cookies=cookies)
    teacher_soup = BeautifulSoup(teacher_result.text)
    teacher_options = teacher_soup.find_all('option')

    teachers = []

    for option in teacher_options:
        abbrev = option.string

        if abbrev.isalnum():
            new_user = { 'ref': 3,
                         'llnr': abbrev,
                         'name': abbrev,
                         'group': 'Docent' }
            teachers.append(new_user)

    return teachers


def get_classrooms():
    classroom_url = '{0}selectie.inc.php?wat=groep&weeknummer={1}&groep=*allen&type=2'.format(base_url, week_n)
    classroom_result = requests.get(classroom_url, cookies=cookies)
    classroom_soup = BeautifulSoup(classroom_result.text)
    classroom_options = classroom_soup.find_all('option')

    classrooms = []

    for option in classroom_options:
        abbrev = option.string

        if abbrev.isalnum():
            new_user = { 'ref': 4,
                         'llnr': abbrev,
                         'name': abbrev,
                         'group': 'Lokaal' }
            classrooms.append(new_user)

    return classrooms

  
def update_db():
    list_of_users = []

    students = get_students(get_groups())
    for student in students:
        new_student = User(name = student[2],
                         ref = 2,
                         group = student[3],
                         llnr = student[1])
        list_of_users.append(new_student)

    teachers = get_teachers()
    for teacher in teachers:
        new_teacher = User(name = teacher[1],
                         ref = 3,
                         group = 'Docent',
                         llnr = teacher[1])
        list_of_users.append(new_teacher)

    classrooms = get_classrooms()
    for classroom in classrooms:
        new_classroom = User(name = classroom[1],
                         ref = 4,
                         group = 'Lokaal',
                         llnr = classroom[1])
        list_of_users.append(new_classroom)

    ndb.put_multi(list_of_users)


if __name__ == '__main__':
    update_db()