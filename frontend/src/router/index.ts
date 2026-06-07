import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: '/menu',
        name: 'Menu',
        component: () => import('@/views/Menu.vue')
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/Menu.vue')
      },
      {
        path: '/loan-calculator',
        name: 'LoanCalculator',
        component: () => import('@/views/LoanCalculator.vue')
      },
      {
        path: '/random-picker',
        name: 'RandomPicker',
        component: () => import('@/views/RandomPicker.vue')
      },
      {
        path: '/holiday-calendar',
        name: 'HolidayCalendar',
        component: () => import('@/views/HolidayCalendar.vue')
      },
      {
        path: '/word-counter',
        name: 'WordCounter',
        component: () => import('@/views/WordCounter.vue')
      },
      {
        path: '/audio-clipper',
        name: 'AudioClipper',
        component: () => import('@/views/AudioClipper.vue')
      },
      {
        path: '/ip-lookup',
        name: 'IpLookup',
        component: () => import('@/views/IpLookup.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
