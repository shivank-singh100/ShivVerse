import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import authService from '../services/authService'
import { Notify } from 'quasar'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE || '/'),

    // Add error handling
    onError: (error) => {
      console.error('Router error:', error)
    }
  })

  // Add navigation guards
  Router.beforeEach((to, from, next) => {
    // Check if route requires authentication
    const isAuthenticated = authService.isLoggedIn()

    // Routes that require authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        Notify.create({
          type: 'warning',
          message: 'You need to log in to access this page',
          position: 'top',
          timeout: 2000
        })

        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
      } else {
        // User is authenticated, proceed
        next()
      }
    }
    // Routes only for guests (non-authenticated users)
    else if (to.matched.some(record => record.meta.guestOnly)) {
      if (isAuthenticated) {
        // User is authenticated, redirect to home
        next({ name: 'home' })
      } else {
        // User is not authenticated, proceed
        next()
      }
    } else {
      // No auth requirements for this route
      next()
    }
  })

  return Router
})
