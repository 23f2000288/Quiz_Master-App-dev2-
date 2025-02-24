
  export default {
    template: `
      <div class="container mt-4">
        <!-- Search Input -->
        <div class="mb-3">
          <input
            type="text"
            class="form-control"
            v-model="searchQuery"
            placeholder="Search quizzes or subjects..."
          />
        </div>
  
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
  
        <div v-else>
          <!-- Subjects and Chapters -->
          <div class="row">
            <div
              class="col-md-4 mb-4"
              v-for="subject in filteredSubjects"
              :key="subject.id"
            >
              <div class="card h-100">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">
                    <i class="fas fa-book me-2"></i>{{ subject.name }}
                  </h5>
                </div>
                <div class="card-body">
                  <p class="card-text">{{ subject.description }}</p>
                  <h6 class="mt-3"><i class="fas fa-list me-2"></i>Chapters:</h6>
                  <ul class="list-group list-group-flush">
                    <li
                      class="list-group-item"
                      v-for="chapter in subject.chapters"
                      :key="chapter.id"
                    >
                      {{ chapter.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
  
          <div class="row">
            <!-- Upcoming Quizzes -->
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">
                    <i class="fas fa-calendar-alt me-2"></i>Upcoming Quizzes
                  </h5>
                </div>
                <div class="card-body">
                  <div
                    v-if="filteredUpcomingQuizzes.length === 0"
                    class="text-center text-muted"
                  >
                    No upcoming quizzes found
                  </div>
                  <div v-else>
                    <div
                      v-for="quiz in filteredUpcomingQuizzes"
                      :key="quiz.id"
                      class="quiz-card mb-3"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 class="mb-1">{{ quiz.name }}</h6>
                          <small class="text-muted">
                            {{ quiz.chapter.subject.name }} -
                            {{ quiz.chapter.name }}
                          </small>
                        </div>
                        <div class="text-end">
                          <button
                            @click="showQuizDetails(quiz)"
                            class="btn btn-sm btn-outline-primary me-2"
                          >
                            <i class="fas fa-info-circle"></i> Details
                          </button>
                          <button
                            class="btn btn-sm btn-success"
                            @click="startQuiz(quiz)"
                          >
                            <i class="fas fa-play"></i> Start
                          </button>
                        </div>
                      </div>
                      <div class="quiz-meta mt-2">
                        <span class="badge bg-info me-2">
                          <i class="fas fa-calendar-day me-1"></i>
                          {{ formatDate(quiz.date_of_quiz) }}
                        </span>
                        <span class="badge bg-warning">
                          <i class="fas fa-clock me-1"></i>
                          {{ quiz.time_duration }} mins
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Completed Quizzes -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-header bg-secondary text-white">
                  <h5 class="mb-0">
                    <i class="fas fa-history me-2"></i>Completed Quizzes
                  </h5>
                </div>
                <div class="card-body">
                  <div
                    v-if="filteredCompletedQuizzes.length === 0"
                    class="text-center text-muted"
                  >
                    No completed quizzes yet
                  </div>
                  <div v-else>
                    <div
                      v-for="quiz in filteredCompletedQuizzes"
                      :key="quiz.id"
                      class="quiz-card mb-3"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 class="mb-1">{{ quiz.name }}</h6>
                          <small class="text-muted">
                            {{ quiz.chapter.subject.name }} -
                            {{ quiz.chapter.name }}
                          </small>
                        </div>
                        <div class="text-end">
                          <button
                            v-if="isRegiveAvailable(quiz)"
                            @click="regiveQuiz(quiz)"
                            class="btn btn-sm btn-warning me-2"
                          >
                            <i class="fas fa-redo me-1"></i> Regive
                          </button>
  
                          <button
                            class="btn btn-sm btn-outline-info"
                            @click="showQuizResults(quiz)"
                          >
                            <i class="fas fa-chart-bar me-1"></i> Results
                          </button>
                        </div>
                      </div>
                      <div class="quiz-meta mt-2">
                        <span class="badge bg-info me-2">
                          <i class="fas fa-calendar-day me-1"></i>
                          {{ formatDate(quiz.date_of_quiz) }}
                        </span>
                        <span class="badge bg-success">
                          <i class="fas fa-check-circle me-1"></i>
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Quiz Details Modal -->
          <div
            class="modal fade"
            :class="{ show: showModal }"
            tabindex="-1"
            style="display: block;"
            v-if="showModal"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">{{ selectedQuiz?.name }}</h5>
                  <button type="button" class="btn-close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                  <div v-if="selectedQuiz" class="row">
                    <div class="col-md-6">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <strong>Subject:</strong> {{ selectedQuiz.chapter.subject.name }}
                        </li>
                        <li class="list-group-item">
                          <strong>Chapter:</strong> {{ selectedQuiz.chapter.name }}
                        </li>
                        <li class="list-group-item">
                          <strong>Questions:</strong> {{ selectedQuiz.num_of_ques }}
                        </li>
                      </ul>
                    </div>
                    <div class="col-md-6">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <strong>Date:</strong> {{ formatDate(selectedQuiz.date_of_quiz) }}
                        </li>
                        <li class="list-group-item">
                          <strong>Duration:</strong> {{ selectedQuiz.time_duration }} mins
                        </li>
                        <li class="list-group-item">
                          <strong>Status:</strong>
                          <span :class="statusClass(selectedQuiz)">
                            {{ selectedQuiz.status }}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeModal">
                    Close
                  </button>
                  <button
                    v-if="selectedQuiz?.status === 'upcoming'"
                    type="button"
                    class="btn btn-primary"
                    @click="startQuiz(selectedQuiz)"
                  >
                    <i class="fas fa-play me-1"></i>Start Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Quiz Results Modal -->
          <div
            class="modal fade"
            :class="{ show: showResultsModal }"
            tabindex="-1"
            style="display: block;"
            v-if="showResultsModal"
          >
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Quiz Results: {{ selectedQuiz?.name }}</h5>
                  <button type="button" class="btn-close" @click="closeResultsModal"></button>
                </div>
                <div class="modal-body">
                  <!-- Display Quiz Results -->
                  <div v-if="selectedQuiz && quizResults">
                    <div v-for="(result, index) in quizResults" :key="index" class="mb-4">
                      <h6>Question {{ index + 1 }}: {{ result.question_statement }}</h6>
                      <p>Correct Option: {{ result.correct_option }}</p>
                      <p>Your Answer: {{ result.user_answer || 'Not answered' }}</p>
  
                      <p
                        :class="{
                          'text-success': result.is_correct,
                          'text-danger': !result.is_correct,
                        }"
                      >
                        {{ result.is_correct ? 'Correct' : 'Incorrect' }}
                      </p>
                    </div>
                  </div>
                  <div v-else class="text-center">
                    <p>Loading results...</p>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeResultsModal">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        quizzes: [],
        loading: true,
        showModal: false,
        selectedQuiz: null,
        authToken: localStorage.getItem('auth-token'),
        showResultsModal: false,
        quizResults: [],
        subjects: [],
        searchQuery: "", // Added subjects array
      };
    },
    computed: {
      filteredSubjects() {
        const query = this.searchQuery.toLowerCase();
        return this.subjects.filter((subject) =>
          subject.name.toLowerCase().includes(query)
        );
      },
      filteredUpcomingQuizzes() {
        const query = this.searchQuery.toLowerCase();
        return this.upcomingQuizzes.filter((quiz) =>
          quiz.name.toLowerCase().includes(query)
        );
      },
      filteredCompletedQuizzes() {
        const query = this.searchQuery.toLowerCase();
        return this.completedQuizzes.filter((quiz) =>
          quiz.name.toLowerCase().includes(query)
        );
      },
      upcomingQuizzes() {
        return this.quizzes.filter(
          (quiz) => !quiz.is_completed && new Date(quiz.date_of_quiz) > new Date()
        );
      },
      completedQuizzes() {
        return this.quizzes.filter(
          (quiz) => quiz.is_completed || new Date(quiz.date_of_quiz) <= new Date()
        );
      },
    },
  
    methods: {
      async fetchQuizzes() {
        try {
          const response = await fetch("/api/student/quizzes", {
            headers: {
              "Authentication-Token": this.authToken,
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            throw new Error("Failed to fetch quizzes");
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            this.quizzes = data.map((quiz) => {
              quiz.is_completed = Boolean(quiz.is_completed);
              return quiz;
            });
          } else {
            this.quizzes = [];
          }
          this.loading = false;
          this.polyfillFlatMap();
        } catch (error) {
          console.error("Error fetching quizzes:", error);
          this.quizzes = [];
          this.loading = false;
        }
      },
  
      async fetchSubjects() {
        try {
          const response = await fetch("/api/student/subjects", {
            // Assuming you have an endpoint for fetching subjects
            headers: {
              "Authentication-Token": this.authToken,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch subjects");
          }
          const data = await response.json();
          this.subjects = data;
        } catch (error) {
          console.error("Error fetching subjects:", error);
          this.subjects = [];
        }
      },
  
      polyfillFlatMap() {
        if (!Array.prototype.flatMap) {
          Array.prototype.flatMap = function (callback) {
            return this.reduce((acc, x) => acc.concat(callback(x)), []);
          };
        }
      },
  
      formatDate(dateString) {
        const options = {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
      },
  
      statusClass(quiz) {
        return {
          "text-success": quiz.is_completed,
          "text-warning": !quiz.is_completed,
        };
      },
  
      showQuizDetails(quiz) {
        this.selectedQuiz = quiz;
        this.showModal = true;
      },
  
      closeModal() {
        this.showModal = false;
        this.selectedQuiz = null;
      },
  
      startQuiz(quiz) {
        this.$router.push(`/quiz/${quiz.id}`);
      },
  
      isRegiveAvailable(quiz) {
        return new Date(quiz.date_of_quiz) > new Date();
      },
  
      regiveQuiz(quiz) {
        fetch(`/api/student/quizzes/${quiz.id}/retake`, {
          method: "POST",
          headers: {
            "Authentication-Token": this.authToken,
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to allow quiz retake");
            }
            return response.json();
          })
          .then((data) => {
            alert(data.message);
            this.refreshQuizzes();
          })
          .catch((error) => {
            console.error("Error allowing quiz retake:", error);
            alert("Failed to allow quiz retake");
          });
      },
  
      refreshQuizzes() {
        this.loading = true;
        this.fetchQuizzes();
      },
      handleQuizCompleted() {
        console.log("handleQuizCompleted called");
        this.refreshQuizzes(); //refresh quizzess
  
        this.$router.push("/"); // after refreshing, push the router so that the page reloads
      },
      async showQuizResults(quiz) {
        this.selectedQuiz = quiz;
        try {
          const response = await fetch(`/api/student/quiz/${quiz.id}/results`, {
            headers: {
              "Authentication-Token": this.authToken,
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            throw new Error("Failed to fetch quiz results");
          }
  
          this.quizResults = await response.json(); // Assign the API data
  
          this.showResultsModal = true;
        } catch (error) {
          console.error("Error fetching quiz results:", error);
          this.quizResults = null;
          alert("Failed to fetch quiz results.");
        }
      },
      closeResultsModal() {
        this.showResultsModal = false;
        this.selectedQuiz = null;
        this.quizResults = null;
      },
    },
  
    mounted() {
      this.fetchQuizzes();
      this.fetchSubjects(); // Fetch subjects on component mount
      this.$on("quiz-completed", this.handleQuizCompleted);
    },
  };
  