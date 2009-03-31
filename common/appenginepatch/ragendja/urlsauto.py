# -*- coding: utf-8 -*-
"""
Imports urlpatterns from apps, so we can have nice plug-n-play installation. :)
"""
from django.conf.urls.defaults import *
from django.conf import settings

URLSAUTO_IGNORE_APPS = getattr(settings, 'URLSAUTO_IGNORE_APPS', ())

urlpatterns = patterns('')

for app in settings.INSTALLED_APPS:
    if app == 'ragendja' or app.startswith('django.') or \
            app in URLSAUTO_IGNORE_APPS:
        continue
    try:
        urlpatterns += __import__(app + '.urlsauto', {}, {}, ['']).urlpatterns
    except ImportError:
        pass
