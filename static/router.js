/*import StudentHome from './components/StudentHome.js'*/
import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Quiz from './components/Quiz.js'

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/login', component: Login, name: 'Login' },
  {path:'/register', component: Register, name: 'Register'},
  {path:'/quiz', component: Quiz, name: 'Quiz'},

  
  
]

export default new VueRouter({
  
  routes,
})

