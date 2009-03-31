# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns('webapp.views',
    (r'^$', 'index'),
)
