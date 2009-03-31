# -*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.http import HttpResponse, Http404
from django.views.generic.list_detail import object_list, object_detail
from django.views.generic.create_update import create_object, delete_object, \
	update_object
from google.appengine.ext import db
from mimetypes import guess_type
from webapp.models import Permalink
from ragendja.dbutils import get_object_or_404, db_create
from ragendja.template import render_to_response
from django.template import Context, loader, RequestContext
from google.appengine.api import urlfetch
from django.utils import simplejson, html
import urllib
import random
import re

AGENT = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en-US; rv:1.8.1) Gecko/20061010 Firefox/2.0"
HEADERS = {"User-Agent": AGENT, "Accept-encoding": "gzip"}

type_to_api = {
	'search': "http://search.twitter.com/search.json?q=%s&",
	'favorites': "http://twitter.com/favorites/%s.json?",
	'mine': "http://twitter.com/statuses/friends_timeline.json?",
	'user': "http://twitter.com/statuses/user_timeline/%s.json?"
}

def split_by_token_list(token_list, phrase):
	for token in token_list:
		if token in phrase:
			phrase = phrase.split(token)[0]
	return phrase
	


def index(request):
	t = loader.get_template("home.html")
	c = RequestContext(request)
	return HttpResponse(t.render(c))
	
def prepare_viewer(request, type, user=None, q=None):
	is_search = False
	try:
		if type == "search":
			is_search = True
			api_url = type_to_api[type] % urllib.quote(q)
		elif type == "mine":
			api_url = type_to_api[type]
		else:
			api_url = type_to_api[type] % user
	except KeyError, e:
		pass

	# return HttpResponse(q)

	t = loader.get_template("viewer.html")
	c = RequestContext(request, {'baseURL':api_url, 'is_search':is_search})
	return HttpResponse(t.render(c))