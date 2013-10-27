import datetime
import re
import requests
from google.appengine.ext import ndb
from requests import cookies
from flask import Flask, render_template, request, jsonify
from bs4 import BeautifulSoup
from models import User
from infowebviewer import app
from db_in_memory import memory_db

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

    return render_template('over.html', title=title, week=week)


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
        if rooster is None:
            title = '(Geen) rooster van {0} - Infowebviewer'.format(result.name)
            h2 = 'Rooster van {0} ({1}, {2})'.format(result.name, result.llnr, result.group)
            rooster = '<p style="text-align: center;">Er is voor deze week geen rooster gevonden.</p>'
            return render_template('rooster.html', ref=ref, id_user=id_user, week=week, title=title, rooster=rooster, changes=changes, h2=h2)

        title = 'Rooster van {0} - Infowebviewer'.format(result.name)
        h2 = 'Rooster van {0} ({1}, {2})'.format(result.name, result.llnr, result.group)
        return render_template('rooster.html', ref=ref, id_user=id_user, week=week, title=title, rooster=rooster, changes=changes, h2=h2)

    else:
        title = 'Niet gevonden - Infowebviewer'
        h2 = 'Het rooster is niet gevonden.'
        return render_template('rooster.html', title=title, h2=h2, week=week)


@app.route('/fetch/', methods=['POST'])
def fetch():
    week = request.form['week']
    search_string = request.form['value']

    json_response = {'users': 'true'}
    i = 1

    for key in memory_db:
        if search_string.lower() in memory_db[key]['name'].lower():
            json_user = { 'ref': memory_db[key]['ref'],
                          'llnr': memory_db[key]['llnr'],
                          'name': memory_db[key]['name'],
                          'group': memory_db[key]['group'] }

            json_response[i] = json_user
            i = i + 1

    if json_response == {'users': 'true'}:
        json_response = {'users': 'false'}

    return jsonify(json_response)

@app.errorhandler(404)
def error(e):
    week = str(datetime.date.today().isocalendar()[1])
    error_number = '404'
    title = '404 Niet gevonden - Infowebviewer'
    return render_template('error.html', error_number=e, title=title, week=week)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
