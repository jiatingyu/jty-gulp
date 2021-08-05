# jty-gulp

是通過 gulp 來進行制動化构建

常用命令

```js

jty-gulp build
jty-gulp clean
jty-gulp start


```

# config

可以在项目根目录下创建 data.config.js 文件来指定默认配置

```js
module.exports = {
  data: {
    date: new Date(),
    aaa: 123,
  },
  build: {
    src: "src",
    dist: "relase",
    temp: "_tep",
    public: "public",
    paths: {
      sass: "assets/styles/*.scss",
      js: "assets/scripts/*.js",
      pages: "*.html",
      images: "assets/images/**",
      fonts: "assets/fonts/**",
    },
  },
};
```
