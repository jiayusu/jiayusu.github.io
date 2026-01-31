---
layout: default
title: 所有文章
---

<h2>所有文章</h2>

<ul class="post-list">
  {% for post in site.posts %}
    <li>
      <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
      <div class="post-meta">
        {{ post.date | date: '%Y-%m-%d' }}
        {% if post.tags.size > 0 %}
        <span> | 标签: {% for tag in post.tags %}{{ tag }}{% unless forloop.last %}, {% endunless %}{% endfor %}</span>
        {% endif %}
      </div>
    </li>
  {% endfor %}
</ul>