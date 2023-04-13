// import { createRequire } from 'module'
import { defineConfig } from 'vitepress'
import { routes } from './theme/utils/app-routes.js';
routes('./', { popDirs: [ 'site' ] });

// const require = createRequire(import.meta.url)
// const pkg = require('vitepress/package.json')

// console.log("=============pkg.version", pkg.version);

export default defineConfig({
  title: "this is title",
  description: "site des xxxxx",
  outDir: '../dist',
})
