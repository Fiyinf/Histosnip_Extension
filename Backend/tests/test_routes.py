import os
import base64
from functools import wraps
from pathlib import Path
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from flask import g
from faker import Faker
from tests.load_data import init_db
from flask_sqlalchemy import SQLAlchemy
from flask import Flask

#Tests not ready yet; Issues with Alchemy

FAKER = Faker()
DB = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = "False"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test_db"
    DB.init_app(app)
    return app

@pytest.fixture
def app_inst():
    app = create_app()
    app.debug = True
    init_db(app)
    return app

def test_record_history_new_page(app_inst):
    #Test recording of visit to a new page
    #Check that new WebPage created, first Visit created and Topics extracted and stored
    return

def test_record_history_existing_page(app_inst):
    # Test recording of visit to a existing page
    # Check page already exists, new visit recorded
    # Check that new topics not created
    return


def test_record_history_new_topic(app_inst):
    # New topic is extracted from a new webpage
    # Check that topic is created correctly and linked correctly to page
    return


def test_record_history_existing_topic(app_inst):
    # New webpage is recorded. When page is analyzed, it contains Topics already existing in db
    # Check that topics are not created again and page is linked properly to already existing topic
    return


def test_get_history(app_inst):
    # Test getting all history within given date range
    return



