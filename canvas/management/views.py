from django.shortcuts import render
from django.http import HttpResponse


# Create your views here.
def login(request):
    return render(request, "management/login.html")


def register(request):
    return render(request, "management/register.html")


def projects(request):
    return render(
        request,
        "management/projects.html",
        context={
            "projects": [
                {"name": "Project A", "last_edited": "15.11.2024", "favorite": "true"},
                {"name": "Project B", "last_edited": "15.11.2024", "favorite": "false"},
                {"name": "Project C", "last_edited": "15.11.2024", "favorite": "true"},
                {"name": "Project D", "last_edited": "15.11.2024", "favorite": "true"},
                {"name": "Project E", "last_edited": "15.11.2024", "favorite": "false"},
            ]
        },
    )
