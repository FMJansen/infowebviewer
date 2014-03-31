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

def get_week():
    today = datetime.date.today()
    iso_cal = today.isocalendar()

    # If it's Saturday or Sunday, view next week.
    if iso_cal[2] > 5:
        week = (today + datetime.timedelta(days=8 - iso_cal[2])).isocalendar()[1]
    else:
        week = iso_cal[1]

    return week

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
    first_div = timetable.find(id='hover_caller_id')
    secnd_div = timetable.find(id='hoverinfo')

    trs = []
    even = timetable.table.find_all('tr', { 'class': 'even' })
    oneven = timetable.table.find_all('tr', { 'class': 'oneven' })

    def make_nice_table(trs):
        mon = BeautifulSoup('<table id="mon" class="day">' + '<tr></tr>' * 9 + '</table>');
        tue = BeautifulSoup('<table id="tue" class="day">' + '<tr></tr>' * 9 + '</table>');
        wed = BeautifulSoup('<table id="wed" class="day">' + '<tr></tr>' * 9 + '</table>');
        thu = BeautifulSoup('<table id="thu" class="day">' + '<tr></tr>' * 9 + '</table>');
        fri = BeautifulSoup('<table id="fri" class="day">' + '<tr></tr>' * 9 + '</table>');
        
        for i, tr in enumerate(trs):
            tds = tr.contents
            mon.table.contents[i].append(tds[3])
            tue.table.contents[i].append(tds[4])
            wed.table.contents[i].append(tds[5])
            thu.table.contents[i].append(tds[6])
            fri.table.contents[i].append(tds[7])
            
        nice_table = '{0}{1}<div id="daycontainer">{2}{3}{4}{5}{6}</div>'.format(first_div, secnd_div, mon, tue, wed, thu, fri)
        return nice_table
        
    
    try:
        trs.extend((oneven[0], even[0], oneven[1], even[1], oneven[2], even[2], oneven[3], even[3], oneven[4]))
        nice_table = make_nice_table(trs)
        nice_table = nice_table.decode('utf-8')
    except:
        nice_table = timetable

        
        
    result = {}
    for key in db:
        if id_user.lower() == db[key]['llnr'].lower():
            result['ref'] = db[key]['ref']
            result['llnr'] = db[key]['llnr']
            result['name'] = db[key]['name']
            result['group'] = db[key]['group']

    if timetable is None:
        title = '(Geen) rooster van {0} - Infowebviewer'.format(result['name'])
        h2 = '{0} ({1}, {2})'.format(result['name'], result['llnr'], result['group'])
        timetable = '<p style="text-align: center;">Er is (voor deze week) geen rooster gevonden.</p>'
        return render_template('timetable.html', ref=ref, id_user=id_user, group=result['group'], week=week, title=title, timetable=timetable, h2=h2)

    else:
        if result:
            title = 'Rooster van {0} - Infowebviewer'.format(result['name'])
            h2 = '{0} ({1}, {2})'.format(result['name'], result['llnr'], result['group'])
            return render_template('timetable.html', ref=ref, id_user=id_user, week=week, title=title, timetable=nice_table, h2=h2, group=group)

        else:
            title = 'Gebruiker onbekend - Infowebviewer'
            h2 = 'De gebruiker is niet gevonden, wel een rooster.'
            return render_template('timetable.html', ref=ref, id_user=id_user, week=week, title=title, timetable=nice_table, h2=h2, group=group)


@app.route('/')
def index():
    week = get_week()
    title = 'Rooster Cygnus'
    return render_template('index.html', title=title, week=week)


@app.route('/over/')
def over():
    week = get_week()
    title = 'Over - Infowebviewer'

    return render_template('over.html', title=title, week=week)


@app.route('/<ref>/<group>/<id_user>/<int:week>/')
def timetable(ref,group,id_user,week):
    return make_page(ref, id_user, week, group)


@app.route('/<ref>/<group>/<id_user>/')
def timetable_no_week(ref,group,id_user):
    week = get_week()
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
    week = get_week()
    error_number = '404'
    title = '404 Niet gevonden - Infowebviewer'
    return render_template('error.html', error_number=e, title=title, week=week)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
