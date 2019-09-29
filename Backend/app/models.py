from datetime import datetime
from app import db

#Many-to-many between Topic and WebPage
#One-to-many between WebPage and Visit

Webpage_Topic = db.Table('Webpage_Topic',
    db.Column('webpage_id', db.Integer, db.ForeignKey('webpages.id')),
    db.Column('topic_id', db.Integer, db.ForeignKey('topics.id'))
)

class Topic(db.Model):
    __tablename__ = 'topics'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, index=True, nullable=False)

    def __repr__(self):
        return '<Topic {}>'.format(self.name)


class WebPage(db.Model):
    __tablename__ = 'webpages'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.Text, index=True, unique=True, nullable=False)
    topics = db.relationship('Topic', secondary=Webpage_Topic, backref=db.backref('pages', lazy='dynamic'))
    visits = db.relationship('Visit', backref='page', lazy='dynamic')

    def __repr__(self):
        return '<WebPage {}>'.format(self.url)


class Visit(db.Model):
    __tablename__ = 'visits'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow())
    page_id = db.Column(db.Integer, db.ForeignKey('webpages.id'))

    def __repr__(self):
        return '<Visit {}>'.format(self.timestamp)

class Keyword(db.Model):
    __tablename__ = 'keywords'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)

    def __repr__(self):
        return '<Keyword {}>'.format(self.name)


