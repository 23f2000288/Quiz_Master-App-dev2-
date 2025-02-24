import router from './router.js'
import Navbar from './components/Navbar.js'
import Footer from './components/Footer.js';

router.beforeEach((to, from, next) => {
  // Allow access to Login and Register pages without authentication
  if (
    (to.name !== 'Login' && to.name !== 'Register') &&
    !localStorage.getItem('auth-token')
  ) {
    next({ name: 'Login' }); // Redirect to login if not authenticated
  } else {
    next(); // Proceed to the route
  }
});


new Vue({
  el: '#app',
  template: `<div>
  <Navbar :key='has_changed'/>
  <router-view />
  <Footer :key='has_changed'/></div>`,
  router,
  components: {
    Navbar,
    Footer,
  },
  data: {
    has_changed: true,
  },
  watch: {
    $route(to, from) {
      this.has_changed = !this.has_changed
    },
  },
})
  
