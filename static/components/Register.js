export default {
  template: `
    <section class="vh-100" style="background: 
    linear-gradient(to bottom, #001f3f, #000000);">
      <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col col-xl-13">
            <div class="card" style="border-radius: 1rem;">
              <div class="row g-0">
                <div class="col-md-6 col-lg-5 d-none d-md-block">
                  <img src="/static/img/Mainlogo.png"
                    alt="registration form" class="img-fluid" style="border-radius: 1rem 0 0 1rem;
                    width: 100%; height: 80%; object-fit: cover;" />
                </div>
                <div class="col-md-6 col-lg-7 d-flex align-items-center">
                  <div class="card-body p-4 p-lg-5 text-black">

                    <form @submit.prevent="register">
                      <div class="d-flex align-items-center mb-3 pb-1">
                        <i class="fas fa-user-plus fa-2x me-3" style="color: #ff6219;"></i>
                        <span class="h1 fw-bold mb-0">Register for Quiz Master</span>
                      </div>

                      <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Create your account</h5>

                      <div class="form-outline mb-4">
                        <input type="text" id="fullname" class="form-control form-control-lg" 
                        v-model="user.fullname" placeholder="Full Name" required />
                      </div>

                      <div class="form-outline mb-4">
                        <input type="email" id="email" class="form-control form-control-lg" 
                        v-model="user.email" placeholder="E-mail (Username)" required />
                      </div>

                      <div class="form-outline mb-4">
                        <input type="password" id="password" class="form-control form-control-lg" 
                        v-model="user.password" placeholder="Password" required />
                      </div>

                      <div class="form-outline mb-4">
                        <input type="text" id="qualification" class="form-control form-control-lg" 
                        v-model="user.qualification" placeholder="Qualification" required />
                      </div>

                      <div class="form-outline mb-4">
                        <input type="date" id="dob" class="form-control form-control-lg" 
                        v-model="user.dob" required />
                      </div>

                      <div class="pt-1 mb-4">
                        <button :disabled="isLoading" 
                          class="btn btn-dark btn-lg btn-block" type="submit">
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Register
                        </button>
                      </div>

                      <p class="mb-5 pb-lg-2" style="color: #393f81;">Already have an account? <a href="/login"
                          style="color: #393f81;">Sign in here</a></p>
                      <a href="#" class="small text-muted">Terms of use.</a>
                      <a href="#" class="small text-muted">Privacy policy</a>
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
