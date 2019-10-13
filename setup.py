from setuptools import setup, find_packages

setup(
    name="home-assistant-frontend",
    version="20191002.0",
    description="The 牧养犬 frontend",
    url="https://github.com/home-assistant/home-assistant-polymer",
    author="The 牧养犬 Authors",
    author_email="hello@home-assistant.io",
    license="Apache License 2.0",
    packages=find_packages(include=["hass_frontend", "hass_frontend.*"]),
    include_package_data=True,
    zip_safe=False,
)
