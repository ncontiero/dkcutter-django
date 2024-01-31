from django.urls import resolve, reverse


def test_home(admin_client):
    url = reverse("home")
    assert resolve(url).view_name == "home"
    response = admin_client.get(url)
    assert response.status_code == 200
    assert "pages/home.html" in [t.name for t in response.templates]
    assert "Hello World" in response.content.decode()
