import AdminHome from './AdminHome.js';
import StudentHome from './StudentHome.js';

export default {
  template: `
    <div>
      <AdminHome v-if="userRole === 'admin'" />
      <StudentHome v-if="userRole === 'stud'" />
      <div v-if="!userRole" class="landing-page">
        <h1>Welcome to Our Application</h1>
        <p>Please log in to continue.</p>
        <button @click="goToLogin">Login</button>
      </div>
    </div>
  `,

  data() {
    return {
      userRole: localStorage.getItem('role'),
      authToken: localStorage.getItem('auth-token'),
    };
  },

  methods: {
    goToLogin() {
      this.$router.push('/login'); // Navigate to the login page
    },
  },

  components: {
    AdminHome,
    StudentHome,
  },
};
