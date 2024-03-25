import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/Index.vue'



Vue.use(VueRouter)

const routes = [{
		path: '/',
		redirect: '/home'
	},
	{
		path: '*',
		name: '404',
		component: () => import('../views/404')
	},
	{
		path: '/index',
		name: 'index',
		component: () => import('../views/Index'),
		children: [{
				path: '/home',
				name: 'home',
				component: () => import('../views/Home')
			},
			{
				path: '/login',
				name: 'login',
				component: () => import('../views/Login')
			},
			{
				path: '/register',
				name: 'register',
				component: () => import('../views/Register')
			},
			{
				path: '/database',
				name: 'database',
				component: () => import('../views/database/Database')
			},
			{
				path: '/datasheet',
				name: 'datasheet',
				component: () => import('../views/Datasheet')
			},
			{
				path: '/importlogs',
				name: 'importlogs',
				component: () => import('../views/ImportLogs')
			},
		],
	}
]
const router = new VueRouter({
	mode: 'history',
	routes
})

router.beforeEach((to, from, next) => {
	const isLogin = localStorage.eleToken ? true : false;

	// 检查 token 是否过期
	const expirationTime = localStorage.getItem("eleTokenExpiration");
	if (expirationTime && expirationTime < Date.now()) {
		// Token 已过期
		// 提示用户重新登录或执行刷新 token 操作
		// 可以在这里清除过期的 token 和过期时间
		localStorage.removeItem("eleToken");
		localStorage.removeItem("eleTokenExpiration");
		// 例如，跳转到登录页面
		next("/login");
	} else {
		// 如果已登录或是访问登录页面，则放行
		to.path === "/login" || to.path === "/register" || isLogin ? next() : next("/login");
	}
})

export default router