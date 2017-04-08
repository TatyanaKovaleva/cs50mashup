from flask import Flask, render_template, jsonify, request
from feedparser import parse
import ssl
from flask_sqlalchemy import SQLAlchemy
from helpers.orm import db, Us
from os.path import join,dirname

if hasattr(ssl, '_create_unverified_context'):
    ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///{}'.format(join(dirname(__file__),'mashup.sqlite'))
app.config['SECRET_KEY']='SECRET_KEY'

db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_places', methods=['GET', 'POST'])
def calc_markers():
    left_lat=request.args.get('llat')
    right_lat=request.args.get('rlat')
    left_lng=request.args.get('llng')
    right_lng=request.args.get('rlng')

    dataToReturn=list()
    place_nameList=list()
    for i in Us.query.filter(Us.latitude<right_lat).filter(Us.latitude>left_lat).\
        filter(Us.longitude<right_lng).filter(Us.longitude>left_lng)[:10]:

        placeList=list()

        if i.place_name not in place_nameList:
            place_nameList.append(i.place_name)
            placeList.append(i.place_name)
            placeList.append(i.latitude)
            placeList.append(i.longitude)
            placeList.append(i.postal_code)

            dataToReturn.append(placeList)

    return jsonify(dataToReturn)

@app.route('/get_news', methods=['GET', 'POST'])
def get_news():

    cap=request.args.get('pcode')

    # obtain rss feed
    newsList=list()
    d = parse('http://news.google.com/news/feeds?geo={}&output=rss'.format(cap))
    for k in d.entries:
        titleAndLink=list()
        titleAndLink.append(k.title)
        titleAndLink.append(k.link)
        newsList.append(titleAndLink)

    return jsonify(newsList)

if __name__ == '__main__':
    app.run()
