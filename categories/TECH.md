---
layout: page
title: TECH
permalink: /categories/TECH/
---

{% for post in site.categories.TECH %}
- [{{ post.title }}]({{ post.url }}) - {{ post.date | date: "%Y-%m-%d" }}
{% endfor %}
