
import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Quiz from './components/Quiz.js'
import StudentQuiz from './components/StudentQuiz.js'
import Score from './components/Score.js'
import Users from './components/Users.js'
import Summary from './components/Summary.js'

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/login', component: Login, name: 'Login' },
  {path:'/register', component: Register, name: 'Register'},
  {path:'/quiz', component: Quiz, name: 'Quiz'},
  {path: '/summary', component: Summary, name:'Summary'},
  {
    path: '/quiz/:id',
    component: StudentQuiz,
    name: 'student-quiz'
  },
  {
    path: '/scores',
    name: 'Score',
    component: Score
  },
  {
    path: '/Users',
    name: 'Users',
    component: Users
  },
  
  

  
  
]

export default new VueRouter({
  
  routes,
})

