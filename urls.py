# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from ragendja.urlsauto import urlpatterns
from ragendja.auth.urls import urlpatterns as auth_patterns
from django.contrib import admin

admin.autodiscover()

handler500 = 'ragendja.views.server_error'

urlpatterns = auth_patterns + patterns('',
    ('^admin/(.*)', admin.site.root),
    (r'^$', 'webapp.views.index'),
    (r'^search/(?P<q>.*)/$', 'webapp.views.prepare_viewer', {'type':"search"}),
    (r'^me/$', 'webapp.views.prepare_viewer', {'type':"mine"}),    
    (r'^user/(?P<user>.*)/(?P<type>.*)/$', 'webapp.views.prepare_viewer'),    
    (r'^user/(?P<user>.*)/$', 'webapp.views.prepare_viewer', {'type':'user'}),      
    url(r'^generate-permalink/$', 'webapp.views.generate_permalink', name="generate-permalink"),    
    (r'^name/(?P<name>.*)/$', 'webapp.views.search'),
    (r'^show/(?P<key>.+)$', 'webapp.views.show_phrase'),
    url(r'^search/(?P<name>.*)/$', 'webapp.views.search', name='search'),
) + urlpatterns
