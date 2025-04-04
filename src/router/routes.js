const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/HomePage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/SearchPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'library',
        name: 'library',
        component: () => import('pages/LibraryPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'playlist/:id',
        name: 'playlist',
        component: () => import('pages/PlaylistDetailPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'album/:id',
        name: 'album',
        component: () => import('pages/AlbumDetailPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'artist/:id',
        name: 'artist',
        component: () => import('pages/ArtistDetailPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'liked-songs',
        name: 'liked-songs',
        component: () => import('pages/LikedSongsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'playlists',
        name: 'playlists',
        component: () => import('pages/PlaylistsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/UserProfilePage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('pages/AboutPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('pages/ContactPage.vue'),
        meta: { requiresAuth: false }
      }
    ]
  },

  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('pages/SignupPage.vue'),
        meta: { guestOnly: true }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
