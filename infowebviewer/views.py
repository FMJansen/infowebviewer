import datetime
import re
import requests
from google.appengine.ext import ndb
from requests import cookies
from flask import Flask, render_template, request
from bs4 import BeautifulSoup
from models import User
from infowebviewer import app

infoweb = 'http://www.cygnusgymnasium.nl/ftp_cg/roosters/infoweb/'

def get_rooster(ref,id_user,week):
    url_type = int(ref) - 2
    rooster_url = infoweb + 'compact.php?week={1}&id={2}&type={0}'.format(url_type, week, id_user)

    cookies = requests.get(infoweb + 'index.php').cookies
    response = requests.get(rooster_url, cookies=cookies)

    rooster_soup = BeautifulSoup(response.text)
    return rooster_soup

@app.route('/')
def index():
    week = str(datetime.date.today().isocalendar()[1])
    title = 'Rooster Cygnus'
    return render_template('index.html', title=title, week=week)


@app.route('/over/')
def over():
    week = str(datetime.date.today().isocalendar()[1])
    title = 'Over - Infowebviewer'

    return render_template('over.html', week=week, title=title)


@app.route('/<int:week>/<ref>/<id_user>/')
def rooster(ref,id_user,week):
    bs4_element = get_rooster(ref,id_user,week)

    rooster = bs4_element.table

    changes_list = bs4_element.find_all('pre')
    changes = ''
    for pre in changes_list:
        changes = changes + str(pre)

    result = User.query(User.llnr==id_user).get()

    if result is not None:
        title = 'Rooster van {0} - Infowebviewer'.format(result)
        h2 = 'Rooster van {0} ({1}, {2})'.format(result.name, result.llnr, result.group)
        return render_template('rooster.html', ref=ref, id_user=id_user, week=week, title=title, rooster=rooster, changes=changes, h2=h2)

    else:
        title = 'Niet gevonden - Infowebviewer'
        h2 = 'Het rooster is niet gevonden.'
        return render_template('rooster.html', title=title, h2=h2)


@app.route('/fetch/', methods=['POST'])
def fetch():
    week = request.form['week']
    search_string = request.form['value']

    results = User.query().fetch()

    users = []

    for user in results:
        print user.name, search_string

        if search_string.lower() in user.name.lower() or search_string.lower() in user.llnr.lower():
            insensitive = re.compile(r'(%s)' % search_string, re.IGNORECASE)
            name = insensitive.sub('<strong>\\1</strong>', user.name)
            llnr = insensitive.sub('<strong>\\1</strong>', user.llnr)

            link_name = '{0} ({1}, {2})'.decode('utf8').format(name, llnr, user.group)

            href = '/{0}/{1}/{2}/'.format(week, user.ref, user.llnr)
            users.append({ 'name': link_name, 'href': href })

    if users == []:
        users = [{ 'name': '<i>Geen resultaten</i>', 'href': '' }]

    return render_template('fetch.html', users=users)

@app.errorhandler(404)
def error(e):
    error_number = '404'
    title = '404 Niet gevonden - Infowebviewer'
    return render_template('error.html', error_number=e, title=title)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
