import AdminSummary from './AdminSummary.js';
import StudentSummary from './StudentSummary.js';

export default {
  template: `
    <div>
      <AdminSummary v-if="userRole === 'admin'" />
      <StudentSummary v-if="userRole === 'stud'" />
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
    AdminSummary,
    StudentSummary,
  },
};
