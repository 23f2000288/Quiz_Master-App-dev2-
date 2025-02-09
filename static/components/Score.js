import StudentScore from './StudentScore.js';
export default {
    template: `
      <div>
        
        <StudentScore v-if="userRole === 'stud'" />
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
      
      StudentScore,
    },
  };
  