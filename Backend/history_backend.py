from app import app, db
from app.models import Topic, WebPage, Keyword, Visit


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Topic': Topic, 'WebPage': WebPage, 'Visit': Visit, 'Keyword': Keyword}

#Start up server with flask shell
#Run with flask run
#Put above in readme