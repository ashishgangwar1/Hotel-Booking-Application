from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings # <<< Import settings
from django.conf.urls.static import static # <<< Import static
from django.views.generic import TemplateView


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('booking_api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)