
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("posts", views.posts, name="posts"),
    path("following", views.posts, name="following"),
    path("profile/<str:username>", views.profile, name="profile"),

    path("post/", views.post, name="post"),
    path("post/following", views.following, name="postfollowing"),
    path("post/<int:id>", views.post, name="updatepost"),
    path("post/<int:id>/like", views.like, name="like"),

    path("profile/<str:username>/posts", views.post, name="userpost"),
    
    path("user/<str:username>", views.user, name="user"),
    path("follow/<str:username>", views.follow, name="follow"),

]
