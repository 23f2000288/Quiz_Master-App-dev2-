import AdminQuiz from './AdminQuiz.js';
import StudentQuiz from './StudentQuiz.js';

export default {
  template: `
    <div>
      <AdminQuiz v-if="userRole === 'admin'" />
      <StudentQuiz v-if="userRole === 'stud'" />
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
    AdminQuiz,
    StudentQuiz,
  },
};
