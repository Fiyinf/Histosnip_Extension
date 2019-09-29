from flask import flash, request, jsonify
from app import app
from app.models import Topic, WebPage, Keyword, Visit
from app import db
from .page_analysis import clean_page_text, extract_topics
from datetime import datetime, timedelta

#If from google search results, get webpage's topic from search term and record webpage under that
#If not from google, extract the webpage's topics with word frequency and record webpage under those
@app.route('/record_history', methods=['POST'])
def record_history():
    re = request.json
    from_google = re['from_google']
    url = re['url']
    web_page = get_page(url)

    if from_google:
        wp = get_page(url)
        search_term = re['search_term']
        tp=get_topic(search_term)
        wp.topics.append(tp)
        db.session.commit()
        return jsonify({'message': 'history recorded'}), 200
    else:
        page_html = re['page_html']
        base_url=re['base_url'].lower()
        topics = extract_topics(clean_page_text(page_html), base_url)

        topic_entities = []
        for topic in topics:
            topic_entities.append((get_topic(topic)))

        add_page_to_topics(topic_entities, web_page)
        return jsonify({'message': 'history recorded'}), 200

#Currently gets the past day's history
#TODO: Extend to variable dates choosable by user
@app.route('/get_history', methods=['GET'])
def get_history():
    topics = (db.session.query(Topic)
            .filter(Topic.pages.any(WebPage.visits.any(Visit.timestamp.between(datetime.now() - timedelta(days=1), datetime.now() + timedelta(days=1)))))
         ).all()
    topic_data = {}
    for tp in topics:
        tp_urls = []
        for url in tp.pages:
            tp_urls.append(url.url)
        topic_data[tp.name] = tp_urls

    return jsonify(topic_data)

#If topic already exists, return
#Else create new topic and return that
def get_topic(topic):
    if bool(Topic.query.filter(Topic.name.contains(topic)).first()):
        return Topic.query.filter(Topic.name.contains(topic)).first()
    new_topic = Topic(name=topic)
    db.session.add(new_topic)
    db.session.commit()
    return new_topic

#If webpage already exists, record new visit and return existing webpage
#Else create new webpage, record first visit and return that
def get_page(url):
    wp_query = WebPage.query.filter(WebPage.url.contains(url)).first()
    if bool(wp_query):
        existing_page = wp_query
        existing_page.visits.append(Visit(timestamp=datetime.utcnow()))
        db.session.commit()
        return WebPage.query.filter(WebPage.url.contains(url)).first()
    new_page = WebPage(url=url)
    new_page.visits.append(Visit(timestamp=datetime.utcnow()))
    db.session.add(new_page)
    db.session.commit()
    return new_page

#Add new page to a list of topics
def add_page_to_topics(topics, page):
    for topic in topics:
        page.topics.append(topic)
    db.session.commit()


