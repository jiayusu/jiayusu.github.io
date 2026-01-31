---
layout: default
title: 关于我
---

<h2>关于我</h2>

<p>{{ site.author.bio }}</p>

<p>这个博客是我记录技术学习、产品思考和个人成长的地方。我希望通过分享我的经验和感悟，能够帮助到更多的人。</p>

<p>在这里，你可以找到关于技术开发、产品设计、读书感悟等方面的内容。我会定期更新博客，分享我在学习和工作中的收获和思考。</p>

<h3>联系方式</h3>

<ul>
  <li>GitHub: <a href="https://github.com/{{ site.social_links.github }}">{{ site.social_links.github }}</a></li>
  {% if site.social_links.twitter %}
  <li>Twitter: <a href="https://twitter.com/{{ site.social_links.twitter }}">{{ site.social_links.twitter }}</a></li>
  {% endif %}
  {% if site.social_links.linkedin %}
  <li>LinkedIn: <a href="https://linkedin.com/in/{{ site.social_links.linkedin }}">{{ site.social_links.linkedin }}</a></li>
  {% endif %}
</ul>