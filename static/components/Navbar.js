
export default {
  template: `
    <nav class="navbar navbar-expand-lg" style="background-color: black;">
  <div class="container-fluid">
    <a class="navbar-brand" href="#" style="color: white; font-weight: bold;">Home</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item" >
          <a
            class="nav-link active"
            aria-current="page"
            href="#"
            style="color: white; font-weight: bold; margin-right: 15px;"
          >Quiz</a>
        </li>
        <li class="nav-item" >
          <router-link
            class="nav-link active"
            style="color: white; font-weight: bold; margin-right: 15px;"
            to="/register"
          >Register</router-link>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            href="#"
            style="color: white; font-weight: bold; margin-right: 15px;"
          >Summary</a>
        </li>
        <li class="nav-item" v-if="is_login">
          <a
            class="nav-link"
            href="#"
            style="color: white; font-weight: bold; margin-right: 15px;"
            @click="logout"
          >Logout</a>
        </li>
      </ul>
      <form class="d-flex ms-auto" role="search" v-if="role === 'admin'">
        <input
          class="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
        />
        <button class="btn btn-outline-light" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>

  `,
  data() {
    // Check if 'role' is passed as a URL parameter, otherwise fallback to localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get('role'); // This gets the role from the query string

    return {
      role: roleFromUrl || localStorage.getItem('role') || '', // Use the URL parameter or fall back to localStorage
      is_login: localStorage.getItem('auth-token') || '', // Default to empty if not set
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      this.$router.push({ path: '/login' });
    },
  },
};
