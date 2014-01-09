import datetime
import re
import requests
import logging
from google.appengine.ext import ndb
from requests import cookies
from flask import Flask, render_template, request, jsonify
from bs4 import BeautifulSoup
from models import User
from infowebviewer import app, db

INFOWEB = 'http://www.cygnusgymnasium.nl/ftp_cg/roosters/infoweb/'

def get_timetable(ref,id_user,week,group):
    url_type = int(ref)
    timetable_url = INFOWEB + 'index.php?ref={}'.format(url_type)

    form_data = {
        'weeknummer': week,
        'groep': group,
        'element_id': id_user
    }

    # Get csrf token from a response and add it to form_data
    csrf_response = requests.get(timetable_url)
    csrf_soup = BeautifulSoup(csrf_response.text)
    csrf_input = csrf_soup.find('form').find('input') # csrf input field
    csrf_token = csrf_input['value'] # place of csrf token
    form_data.update(csrf=csrf_token)

    # Convert form_data to text
    form_data_format = 'csrf={csrf}'\
                       '&weeknummer={weeknummer}'\
                       '&groep={groep}'\
                       '&element_id={element_id}'
    form_data = form_data_format.format(**form_data)

    cookies = csrf_response.cookies
    response = requests.post(timetable_url, cookies=cookies, data=form_data)

    timetable_soup = BeautifulSoup(response.text)
    return timetable_soup


def make_page(ref, id_user, week, group):
    bs4_element = get_timetable(ref,id_user,week,group)

    timetable = bs4_element.find('table', attrs={'class':'roostercontainer'})
#    mon = BeautifulSoup('<ul id="mon" class="day"></ul>');
#    tue = BeautifulSoup('<ul id="tue" class="day"></ul>');
#    wed = BeautifulSoup('<ul id="wed" class="day"></ul>');
#    thu = BeautifulSoup('<ul id="thu" class="day"></ul>');
#    fri = BeautifulSoup('<ul id="fri" class="day"></ul>');
#    
#    rows = timetable.find('tr')
#    app.logger.info(len(rows))

    changes_list = bs4_element.find_all('pre')
    changes = ''
    for pre in changes_list:
        changes = changes + str(pre)

    result = User.query(User.llnr==id_user).get()

    if timetable is None:
        title = '(Geen) rooster van {0} - Infowebviewer'.format(result.name)
        h2 = 'Rooster van {0} ({1}, {2})'.format(result.name, result.llnr, result.group)
        timetable = '<p style="text-align: center;">Er is (voor deze week) geen rooster gevonden.</p>'
        return render_template('timetable.html', ref=ref, id_user=id_user, group=result.group, week=week, title=title, timetable=timetable, changes=changes, h2=h2)

    else:
        if result is not None:
            title = 'Rooster van {0} - Infowebviewer'.format(result.name)
            h2 = 'Rooster van {0} ({1}, {2})'.format(result.name, result.llnr, result.group)
            return render_template('timetable.html', ref=ref, id_user=id_user, week=week, title=title, timetable=timetable, changes=changes, h2=h2, group=group)

        else:
            title = 'Gebruiker onbekend - Infowebviewer'
            h2 = 'De gebruiker is niet gevonden, wel een rooster.'
            return render_template('timetable.html', ref=ref, id_user=id_user, week=week, title=title, timetable=timetable, changes=changes, h2=h2, group=group)


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


@app.route('/<ref>/<group>/<id_user>/<int:week>/')
def timetable(ref,group,id_user,week):
    return make_page(ref, id_user, week, group)


@app.route('/<ref>/<group>/<id_user>/')
def timetable_no_week(ref,group,id_user):
    week = int(datetime.date.today().isocalendar()[1])
    return make_page(ref, id_user, week, group)


@app.route('/fetch/', methods=['POST'])
def fetch():
    week = request.form['week']
    search_string = request.form['value']

    json_response = {'users': 'true'}
    i = 1

    for key in db:
        if search_string.lower() in db[key]['name'].lower():
            json_user = { 'ref': db[key]['ref'],
                          'llnr': db[key]['llnr'],
                          'name': db[key]['name'],
                          'group': db[key]['group'],
                          'match': 'name' }

            json_response[i] = json_user
            i = i + 1

        if search_string.lower() in db[key]['llnr'].lower():
            json_user = { 'ref': db[key]['ref'],
                          'llnr': db[key]['llnr'],
                          'name': db[key]['name'],
                          'group': db[key]['group'],
                          'match': 'llnr' }

            json_response[i] = json_user
            i = i + 1

        if search_string.lower() in db[key]['group'].lower():
            json_user = { 'ref': db[key]['ref'],
                          'llnr': db[key]['llnr'],
                          'name': db[key]['name'],
                          'group': db[key]['group'],
                          'match': 'group' }

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
