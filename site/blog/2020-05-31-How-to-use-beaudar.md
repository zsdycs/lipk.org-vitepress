---
title: '使用评论插件 Beaudar'
date: '2020-05-31'
slug: 'how-to-use-beaudar'
head:
  - - meta
    - name: description
      content: 很多人的博客都会有评论功能。对于大多数静态博客来说，评论是读者与博主建立联系的唯一桥梁。
---

很多人的博客都会有评论功能。对于大多数静态博客来说，评论是读者与博主建立联系的唯一桥梁。

被广泛使用的评论插件是 [Disqus](https://disqus.com/)，遗憾国外 UCG （用户自产内容）基本上都被墙了，国内还没看到有与其同样优秀的。

我使用过 [Wildfire](https://wildfire.js.org) 🔥，UI 很不错，但是要用 [Firebase](https://firebase.google.com) ，在国内很不稳定，用了一段时间后发现使用 GitHub issue 的 [Utterances](https://github.com/utterance/utterances) 非常轻便快速，然后开始使用 Utterances。
当然类似的项目，国内有：

- [Gitalk](https://github.com/gitalk/gitalk)
- [Vssue](https://github.com/meteorlxy/vssue)
- [Gitment](https://github.com/imsun/gitment)（无人维护）

除了以上提到的，国内被广泛使用的，还有 [Valine](https://valine.js.org/)，使用了 [Gravatar](http://cn.gravatar.com/) 作为用户图像，评论只需要提供 Gravatar 账号设置的邮箱，非常方便。

但是还是觉得 utterances 的实现比较好，但是没有多语言是个缺陷。索性把它的源码拿来自己改成中文的了。

于是，就有了 [Beaudar - 表达](https://beaudar.lipk.org)。

我使用的是“Issue 标题包含页面标题”的版本，另外还有五个模式任君选择。引用代码可以在线生成。也可以参考我下方给出的代码片段，在引用时，我增加了模式切换提示，及加载的状态。

完整的代码片段在 [这里查看](https://github.com/zsdycs/lipk.org-hugo/blob/master/static/js/beaudar.js)。

```javascript
/**
 * 在 #beaudar 处，append 评论的 script
 */
function addBeaudar() {
  // 显示加载状态
  var loading = document.getElementById('loading');
  loading.style.display = 'flex';
  var script = document.createElement('script');
  var beaudar = document.getElementById('beaudar');
  script.src = 'https://beaudar.lipk.org/client.js';
  script.setAttribute('repo', 'zsdycs/lipk.org-hugo');
  script.setAttribute('issue-term', 'title');
  script.setAttribute('crossorigin', 'anonymous');
  if (window.localStorage.getItem('mode') === 'day') {
    script.setAttribute('theme', 'github-light');
    window.localStorage.setItem('beaudar-theme', 'github-light');
  } else {
    script.setAttribute('theme', 'github-dark');
    window.localStorage.setItem('beaudar-theme', 'github-dark');
  }
  script.async = true;
  beaudar.appendChild(script);
  // 处理评论是否加载完成
  beaudarEnd();
}
```
