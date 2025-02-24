
export default {
  template: `
  <section class="vh-100" style="background: linear-gradient(to bottom, rgb(255, 170, 29), rgb(255, 170, 29)); height: 100vh;">
      <div class="container py-5 h-100">
          <div class="row d-flex justify-content-center align-items-center h-100">
              <div class="col col-xl-13">
                  <div class="card" style="border-radius: 1rem;">
                      <div class="row g-0">
                          <div class="col-md-6 col-lg-5 d-none d-md-block">
                              <img src="/static/img/Mainlogo.png" alt="login form" class="img-fluid" 
                                  style="border-radius: 1rem 0 0 1rem; width: 100%; height: 80%; object-fit: cover;" />
                          </div>
                          <div class="col-md-6 col-lg-7 d-flex align-items-center">
                              <div class="card-body p-4 p-lg-5 text-black">
                                  <form @submit.prevent="login">
                                      <div class="d-flex align-items-center mb-3 pb-1">
                                          <i class="fas fa-cubes fa-2x me-3" style="color: #ff6219;"></i>
                                          <span class="h1 fw-bold mb-0">Welcome to Quiz Master</span>
                                      </div>

                                      <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Log into your account</h5>

                                      <div v-if="error" class="alert alert-danger" role="alert">
                                          {{ error }}
                                      </div>

                                      <div data-mdb-input-init class="form-outline mb-4">
                                          <input type="email" id="form2Example17" class="form-control form-control-lg"
                                              v-model='cred.email' placeholder="E-mail(Username)" required />
                                      </div>

                                      <div data-mdb-input-init class="form-outline mb-4">
                                          <input type="password" id="form2Example27" class="form-control form-control-lg"
                                              v-model="cred.password" placeholder="Password" required />
                                      </div>

                                      <div class="pt-1 mb-4">
                                          <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" 
                                              type="submit">Login</button>
                                      </div>

                                      <p class="mb-5 pb-lg-2" style="color:rgb(17, 16, 16);">Don't have account? 
                                          <router-link to="/register" style="color: #393f81;">Register here</router-link>
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
          cred: {
              "email": null,
              "password": null
          },
          error: null,
      }
  },
  methods: {
      async login() {
          try {
              const res = await fetch('/user-login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(this.cred),
              })
              const data = await res.json()
              if (res.ok) {
                  localStorage.setItem('auth-token', data.token)
                  localStorage.setItem('role', data.role)
                  this.$router.push({ path: '/' })
              } else {
                  if (res.status === 403) {
                      this.error = "Your account is deactivated. Please contact the administrator."
                  } else {
                      this.error = data.message || "An error occurred during login."
                  }
              }
          } catch (error) {
              console.error('Login error:', error)
              this.error = "An unexpected error occurred. Please try again later."
          }
      },
  },
}
