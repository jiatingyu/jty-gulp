/** 开始构建任务: 要做的事情
 *
 * 1. 编译 css/js /html
 *      gulp-sass sass
 *      gulp-babel @babel/core @babel/preset-env
 *      gulp-swig
 * 2. 压缩 图片、字体文件
 *      gulp-imagemin
 * 3.   其他的文件public 默认直接导入
 *      直接导出 不用任何插件
 * 4. dist 文件夹的clean    ---
 *      del
 * 6. 第三方模块的代码的导入
 *      gulp-useref
 * 5. 自动加载插件
 *      gulp-load-pluginss
 * 7. 开发服务器
 *      broser-sync
 * 8. 自动监视文件的改变
 *      watch
 * 9. html/js/css 的压缩
 *      gulp-htmlmin
 *      gulp-uglify
 *      gulp-clean-css
 */
const path = require('path')
const { src, dest, parallel, series, watch } = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugin = loadPlugins()
const BrwoserSync = require('browser-sync')
let del = require('del')
let bs = BrwoserSync.create()
// 手动加载插件
// let plugin.swig = require('gulp-swig')
// let plugin.babel = require('gulp-babel')
// let plugin.imagemin = require('gulp-imagemin')
// let clean = require('gulp-clean')

// 加载客户自定义的配置

let config = {
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      sass: 'assets/styles/*.scss',
      js: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  }
}

const loadClientConfig = () => {
  let loadDataConfig = null
  try {
    loadDataConfig = require(path.join(process.cwd(), 'data.config.js'))
    console.log('data', loadDataConfig)
  } catch (error) {
    console.log('error', error.message)
  }
  return Object.assign({}, config, loadDataConfig)
}
config = loadClientConfig()

const clean = () => {
  return del([config.build.dist, config.build.temp])
}
/** 定义私有任务 */
const html = () => {
  return src(config.build.paths.pages, { base: 'src', cwd: config.build.src })
    .pipe(plugin.swig({ data: config.data, defaults: { cache: false } }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const css = () => {
  return src(config.build.paths.sass, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugin.sass())
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const js = () => {
  return src(config.build.paths.js, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugin.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}
const image = () => {
  return src(config.build.paths.images, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugin.imagemin())
    .pipe(dest(config.build.dist))
}
const fonts = () => {
  return src(config.build.paths.fonts, {
    base: config.build.src,
    cwd: config.build.src
  })
    .pipe(plugin.imagemin())
    .pipe(dest(config.build.dist))
}

const public = () => {
  return src('**', {
    base: config.build.public,
    cwd: config.build.public
  }).pipe(dest(config.build.dist))
}

const serve = () => {
  // watch('src/assets/styles/*.scss', css)
  // watch('src/assets/scripts/*.js', js)
  // watch('src/*.html', html)
  watch(config.build.paths.sass, { cwd: config.build.src }, css)
  watch(config.build.paths.js, { cwd: config.build.src }, js)
  watch(config.build.paths.pages, { cwd: config.build.src }, html)

  // watch(['src/assets/images/**', 'src/assets/fonts/**', 'public/**'], bs.reload)
  // watch(['src/assets/images/**', 'src/assets/fonts/**', 'public/**'], bs.reload)
  watch(
    [config.build.paths.images, config.build.paths.fonts],
    { cwd: config.build.src },
    bs.reload
  )
  watch('**', { cwd: config.build.public }, bs.reload)

  // watch('dist/**', bs.reload)
  bs.init({
    notify: false,
    port: 2080,
    open: false,
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () => {
  return src(config.build.paths.pages, {
    base: config.build.temp,
    cwd: config.build.temp
  })
    .pipe(plugin.useref({ searchPath: [config.build.temp, '.'] }))
    .pipe(plugin.if('*.js', plugin.uglify()))
    .pipe(plugin.if('*.css', plugin.cleanCss()))
    .pipe(plugin.if('*.html', plugin.htmlmin({ collapseWhitespace: true })))
    .pipe(dest(config.build.dist))
}

const complier = parallel(html, css, js)
const build = series(
  clean,
  parallel(series(complier, useref), fonts, image, public)
)
const start = series(complier, serve)
module.exports = {
  clean,
  build,
  start
}
