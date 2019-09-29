import urllib
from bs4 import BeautifulSoup
# from urllib.request import urlopen
import nltk
from nltk.collocations import *
from collections import Counter
from nltk.corpus import stopwords
import re

#Remove html tags and scripts; get the true text of the webpage
def clean_page_text(html):
    soup = BeautifulSoup(html)
    for script in soup(["script", "style"]):
        script.extract()

    text = soup.get_text()
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    return text

#Extract topics from text
#Currently uses word frequency
#TODO: Something better than word frequency
def extract_topics(text, base_url):
    #For the future: check out https://www.intellexer.com/clusterizer.html
    #find most frequent bigrams. If none, use most frequent word. don't forget to remove stop words
    #actually forget the bigrams
    stoplist = stopwords.words('english')
    stoplist.extend(['i', 'I', 'you', 'You'])
    clean = re.sub('[0-9]+', '', text)
    clean = [word for word in re.split(r"\W+", clean) if word not in stoplist]
    top_10 = Counter(clean).most_common(10)
    index = 0
    topics = []
    for word, count in top_10:
        if word.lower() in base_url:
            continue
        topics.append(word.lower())
        index+=1
        if index > 2:
            break
    return topics


# Currently not working out :/
# def extract_bigrams(text):
#     stoplist = stopwords.words('english')
#     clean = [word for word in re.split(r"\W+", text) if word not in stoplist]
#     tokens = nltk.word_tokenize(clean)
#
#
#     bgs = nltk.bigrams(tokens)
#
#
#     fdist = nltk.FreqDist(bgs)
#     top_10 = Counter(fdist).most_common(10)
#     for k, v in top_10:
#         print (k, v)