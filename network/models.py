from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    def serialize(self, currentUser, currentFollowing):
        return {
            "username": self.username,
            "currentUser": currentUser,
            "currentFollowing": currentFollowing,
            "following": self.following.count(),
            "followers": self.followers.count()
        }

class UserAux(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fromThis")
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="toThis")

    def __str__(self):
            return f"{self.user}: {self.follower}" 

User.add_to_class('followers', models.ManyToManyField('self', through=UserAux, related_name='following', symmetrical=False))

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="liked")
    

    def __str__(self):
            return f"{self.user}: {self.content}: {self.likes}" 

    def serialize(self, userId):

        userAux = User.objects.get(id=userId)
        myLike = self.likes.filter(username = userAux.username).count()

        return {
            "id": self.id,
            "username": self.user.username,
            "email": self.user.email,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.all().count(),
            "myPost": True if self.user.id == userId else False,
            "myLike": True if myLike == 1 else False
            
        }
