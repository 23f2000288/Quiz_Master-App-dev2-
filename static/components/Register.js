export default {
  template: `
    <section 
  class="vh-100" 
  style="background: linear-gradient(to bottom, rgb(255, 170, 29), rgb(255, 170, 29)); height: 100vh;">
  
      <div class="container py-4 h-100"> <!-- Reduced padding -->
  <div class="row d-flex justify-content-center align-items-center h-100">
    <div class="col-md-10 col-lg-8 col-xl-7"> <!-- Reduced column width -->
      <div class="card" style="border-radius: 1rem;">
        <div class="row g-0">
          <div class="col-md-5 d-none d-md-block">
            <img src="/static/img/Mainlogo.png"
              alt="registration form" class="img-fluid"
              style="border-radius: 1rem 0 0 1rem; width: 100%; height: auto; object-fit: cover;" />
          </div>
          <div class="col-md-7 d-flex align-items-center">
            <div class="card-body p-3 p-lg-4 text-black"> <!-- Reduced padding -->

              <form @submit.prevent="register">
                <div class="d-flex align-items-center mb-3 pb-1">
                  <i class="fas fa-user-plus fa-1x me-2" style="color: #ff6219;"></i> <!-- Smaller icon -->
                  <span class="h3 fw-bold mb-0">Register for Quiz Master</span> <!-- Smaller heading -->
                </div>

                <h6 class="fw-normal mb-3 pb-2" style="letter-spacing: 0.5px;">Create your account</h6> <!-- Smaller subheading -->

                <div class="form-outline mb-3">
                  <input type="text" id="fullname" class="form-control form-control-md" 
                  v-model="user.fullname" placeholder="Full Name" required />
                </div>

                <div class="form-outline mb-3">
                  <input type="email" id="email" class="form-control form-control-md" 
                  v-model="user.email" placeholder="E-mail (Username)" required />
                </div>

                <div class="form-outline mb-3">
                  <input type="password" id="password" class="form-control form-control-md" 
                  v-model="user.password" placeholder="Password" required />
                </div>

                <div class="form-outline mb-3">
                  <input type="text" id="qualification" class="form-control form-control-md" 
                  v-model="user.qualification" placeholder="Qualification" required />
                </div>

                <div class="form-outline mb-3">
                  <input type="date" id="dob" class="form-control form-control-md" 
                  v-model="user.dob" required />
                </div>

                <div class="pt-1 mb-3">
                  <button :disabled="isLoading" 
                    class="btn btn-dark btn-md btn-block" type="submit"> <!-- Reduced button size -->
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Register
                  </button>
                </div>

                <p class="mb-4 pb-lg-1" style="color:rgb(17, 16, 16); font-size: 0.9rem;">Already have an account? 
                  <router-link to="/login" style="color: #393f81;">Sign in here</router-link>
                </p>
                
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    </section>
  `,
  data() {
    return {
      user: {
        fullname: null,
        email: null,
        password: null,
        qualification: null,
        dob: null,
      },
      isLoading: false, // Track loading state
    };
  },
  methods: {
    async register() {
      // Ensure all fields are filled
      if (Object.values(this.user).some(field => !field)) {
        alert("All fields are required.");
        return;
      }

      this.isLoading = true;
      try {
        const res = await fetch('/api/register_user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.user),
        });

        if (res.ok) {
          alert('Registration successful! Please log in.');
          this.$router.push({ path: '/login' });
        } else {
          const error = await res.json();
          alert(`Registration failed: ${error.message}`);
        }
      } catch (err) {
        alert('An error occurred during registration. Please try again later.');
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
  },
}
