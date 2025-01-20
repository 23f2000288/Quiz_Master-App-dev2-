export default{
    template:`
    <section class="vh-100" style="background: 
    linear-gradient(to bottom, #001f3f, #000000);">
  <div class="container py-5 h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col col-xl-13">
        <div class="card" style="border-radius: 1rem;">
          <div class="row g-0">
            <div class="col-md-6 col-lg-5 d-none d-md-block">
              <img src="/static/img/Mainlogo.png"
                alt="login form" class="img-fluid" style="border-radius: 1rem 0 0 1rem;
                width: 100%; height: 80%; object-fit: cover;" />
            </div>
            <div class="col-md-6 col-lg-7 d-flex align-items-center">
              <div class="card-body p-4 p-lg-5 text-black">

                <form>

                  <div class="d-flex align-items-center mb-3 pb-1">
                    <i class="fas fa-cubes fa-2x me-3" style="color: #ff6219;"></i>
                    <span class="h1 fw-bold mb-0">Welcome to Quiz Master</span>
                  </div>

                  <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Sign into your account</h5>

                  <div data-mdb-input-init class="form-outline mb-4">
                    <input type="email" id="form2Example17" class="form-control form-control-lg"
                    v-model='cred.email' placeholder="E-mail(Username)" />
                    
                  </div>

                  <div data-mdb-input-init class="form-outline mb-4">
                    <input type="password" id="form2Example27" class="form-control form-control-lg"
                    v-model="cred.password" placeholder="Password" />
                    
                  </div>

                  <div class="pt-1 mb-4">
                    <button data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" 
                    type="button" @click='login'>Login</button>
                  </div>

                  
                  <p class="mb-5 pb-lg-2" style="color: #393f81;"><router-link
            class="nav-link active"
            style="color: black; font-weight: bold; margin-right: 15px;"
            to="/register"
          ><p>Don't have account register here </p>Register</router-link></p>
                  <a href="#!" class="small text-muted">Terms of use.</a>
                  <a href="#!" class="small text-muted">Privacy policy</a>
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
    data(){
        return {
            cred:{
                "email":null,
                "password":null
            },
            error : null,
    
        }
    },
    methods:{
        async login(){
            const res = await fetch('/user-login',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.cred),
            })
            const data = await res.json()
            if(res.ok){
                
                localStorage.setItem('auth-token', data.token)
                localStorage.setItem('role', data.role)
                this.$router.push({path: '/'})
            }
            else {
              this.error= data.message
            }

        },
    },
}