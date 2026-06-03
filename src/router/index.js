import { createRouter, createWebHashHistory } from 'vue-router'

// 懒加载页面组件
const Home = () => import('../components/Home.vue')
const Login = () => import('../components/auth/Login.vue')
const Register = () => import('../components/auth/Register.vue')
const ForgotPassword = () => import('../components/auth/ForgotPassword.vue')
const PasswordReset = () => import('../components/auth/PasswordReset.vue')
const Balance = () => import('../components/balance/Balance.vue')
const Salary = () => import('../components/salary/Salary.vue')
const UserSettings = () => import('../components/auth/UserSettings.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '首页', tabIcon: 'home', noAuth: true }
  },
  {
    path: '/salary',
    name: 'salary',
    component: Salary,
    meta: { title: '月薪管理', tabIcon: 'salary' }
  },
  {
    path: '/balance',
    name: 'balance',
    component: Balance,
    meta: { title: '结余管理', tabIcon: 'balance' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: '注册', noAuth: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { title: '忘记密码', noAuth: true }
  },
  {
    path: '/password-reset',
    name: 'password-reset',
    component: PasswordReset,
    meta: { title: '重置密码', noAuth: true }
  },
  {
    path: '/user-settings',
    name: 'user-settings',
    component: UserSettings,
    meta: { title: '用户设置' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router