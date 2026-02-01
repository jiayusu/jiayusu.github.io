---
layout: default
title: 首页
---

<h2>最新文章</h2>

<ul class="post-list">
  {% for post in site.posts limit:5 %}
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

<h2>文章分类</h2>

{% assign categories = site.categories | sort %}
<ul>
  {% for category in categories %}
    <li>
      {{ category[0] }} ({{ category[1].size }})
    </li>
  {% endfor %}
</ul>

<h2>文章归档</h2>

{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
{% for year in posts_by_year %}
  <h3>{{ year.name }}</h3>
  {% assign posts_by_month = year.items | group_by_exp: "post", "post.date | date: '%m'" %}
  <ul>
    {% for month in posts_by_month %}
      <li>
        {{ year.name }}年{{ month.name }}月 ({{ month.items.size }})
      </li>
    {% endfor %}
  </ul>
{% endfor %}

<h2>关于我</h2>

<p>{{ site.author.bio }}</p>
<p>这个博客是我记录技术学习、产品思考和个人成长的地方。我希望通过分享我的经验和感悟，能够帮助到更多的人。</p>
<p>在这里，你可以找到关于技术开发、产品设计、读书感悟等方面的内容。我会定期更新博客，分享我在学习和工作中的收获和思考。</p>