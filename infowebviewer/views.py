import datetime
import re
import requests
from flask import Flask, render_template, request
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from bs4 import BeautifulSoup
from models import User, db

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

    result = User.query.filter_by(llnr=id_user).first()
    title = 'Rooster van {0} - Infowebviewer'.format(result.name)

    h2 = '{0} ({1}, {2})'.format(result.name, result.llnr, result.group)

    return render_template('rooster.html', ref=ref, id_user=id_user, week=week, title=title, rooster=rooster, changes=changes, h2=h2)


@app.route('/fetch/', methods=['POST'])
def fetch():
    week = request.form['week']
    search_string = request.form['value']
    search_query = "%{0}%".format(search_string)

    results = User.query.filter(or_(User.name.like(search_query), User.llnr.like(search_query))).all()

    users = []

    for user in results:

        insensitive = re.compile(r'(%s)' % search_string, re.IGNORECASE)
        name = insensitive.sub('<strong>\\1</strong>', user.name)

        link_name = '{0} ({1}, {2})'.decode('utf8').format(name, user.llnr, user.group)

        href = '/{0}/{1}/{2}/'.format(week, user.ref, user.llnr)
        users.append({ 'name': link_name, 'href': href })

    return render_template('fetch.html', users=users)
