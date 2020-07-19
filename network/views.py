import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from django.core.paginator import Paginator

from .models import User, Post, UserAux


def index(request):
    # Authenticated users view index
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse("profile", args=(request.user.username,)))

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def profile(request, username):
    return render(request, "network/profile.html")

def posts(request):
    if request.user.is_authenticated:

        if request.get_full_path() == '/following':
            return render(request, "network/following.html")
        else:
            return render(request, "network/posts.html")
        
        
    else:
        return HttpResponseRedirect(reverse("login"))

def user(request, username):

    if request.method == "GET":

        id = request.user.id
        loggedUser = User.objects.get(id=id)

        

        try:
            
            user = User.objects.get(username=username)
            
            

            if(loggedUser == user):
                currentUser = True
                currentFollowing = False

            else:
                
                currentUser = False

                followers = user.followers.filter()
                follower = followers.filter(id=loggedUser.id)

                if len(follower) == 1:
                    currentFollowing = True
                else:
                    currentFollowing = False
                

            return JsonResponse(user.serialize(currentUser, currentFollowing), safe=False)

        except User.DoesNotExist:
            return JsonResponse({"error": "GET or POST request required."}, status=400)

        
def post(request, username = '', id = 0):

    userId = request.user.id

    if request.method == "POST":
        
        data = json.loads(request.body)
        
        user = User.objects.get(id=userId)
        content = data.get("post")
        
        post = Post(user=user, content=content)
        post.save()

        return JsonResponse(post.serialize(userId), safe=False)

    elif request.method == "PUT":

        data = json.loads(request.body)
        
        user = User.objects.get(id=userId)
        newContent = data.get("newContent")
        
        try:
            post = Post.objects.get(id=id, user=user)
        except Post.DoesNotExist:
            return JsonResponse({"error": "You can only edit your own posts!"}, status=400)
            
        post.content = newContent
        post.save()

        return JsonResponse({'id': post.id, 'content': post.content}, safe=False)
        

    elif request.method == "GET":

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = None        

        if user == None:
            posts = Post.objects.filter()
        else:
            posts = Post.objects.filter(user=user)
        
        posts = posts.order_by("-timestamp").all()

        page = request.GET["page"]
        p = Paginator(posts, 10)
        posts = p.page(page).object_list

        return JsonResponse({"pages": p.num_pages, "posts": [post.serialize(userId) for post in posts]}, safe=False)

    else:
        return JsonResponse({"error": "GET or POST request required."}, status=400)


def follow(request, username):
    
    if request.method == "PUT":

        id = request.user.id
        loggedUser = User.objects.get(id=id)
        
        try:
            
            user = User.objects.get(username=username)

            if(loggedUser == user):
                
                return JsonResponse({"error": "You cannot follow yourself."}, status=400)

            else:
                
                followers = user.followers.count()
                follower = user.followers.filter(username=loggedUser.username).count()

                if follower == 1:
                    user.followers.remove(loggedUser)
                    followers = followers - 1

                else:
                    user.followers.add(loggedUser)
                    followers = followers + 1

            return JsonResponse({"follower": followers}, status=200)

        except User.DoesNotExist:
            return JsonResponse({"error": "Error"}, status=200)

def like(request, id):

    if request.method == "POST":
        userId = request.user.id
        loggedUser = User.objects.get(id=userId)

        post = Post.objects.get(id=id)
        likes = post.likes.count()
        liked = post.likes.filter(username=loggedUser.username).count()

        if liked == 1:
            post.likes.remove(loggedUser)
            likes = likes - 1
        else:
            likes = likes + 1
            post.likes.add(loggedUser)

        return JsonResponse({"likes": likes}, status=200)

    return JsonResponse({"error": "Error"}, status=200)

def following(request):

    if request.method == "GET":

        userId = request.user.id
        loggedUser = User.objects.get(id=userId)   
        followingUsers = loggedUser.following.all()

        posts = Post.objects.filter(user__in=followingUsers)

        page = request.GET["page"]
        p = Paginator(posts, 10)
        posts = p.page(page).object_list

        return JsonResponse({"pages": p.num_pages, "posts": [post.serialize(userId) for post in posts]}, safe=False)

    else:
        return JsonResponse({"error": "GET or POST request required."}, status=400)
