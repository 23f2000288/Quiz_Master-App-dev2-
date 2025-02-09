export default {
  template: `
  <div class="container-fluid quiz-container bg-light py-4">
    <div class="quiz-header d-flex justify-content-between align-items-center mb-4 p-3 rounded shadow bg-white">
      <div class="quiz-info">
        <h2 class="quiz-title text-primary mb-0">{{ quiz.name }}</h2>
        <p class="quiz-subtitle text-muted mb-0">{{ quiz.chapter.subject.name }} - {{ quiz.chapter.name }}</p>
      </div>
      <div class="timer-wrapper">
        <div class="timer-container d-flex align-items-center">
          <div class="timer-icon me-3">
            <i class="fas fa-clock text-danger fa-2x"></i>
          </div>
          <div class="timer-display">
            <span class="time-text h3 mb-0 font-weight-bold">{{ formatTime(timeLeft) }}</span>
            <button 
              @click="pauseTimer" 
              class="btn btn-sm btn-outline-secondary ms-2"
            >
              <i class="fas" :class="isPaused ? 'fa-play' : 'fa-pause'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="question-menu mb-4">
      <div class="d-flex flex-wrap gap-2 justify-content-center">
        <button 
          v-for="n in quiz.num_of_ques" 
          :key="n"
          class="btn btn-sm btn-outline-primary question-nav-btn rounded-circle"
          :class="{ 'active': currentQuestion === n }"
          @click="goToQuestion(n)"
        >
          {{ n }}
        </button>
      </div>
    </div>

    <div class="question-container" v-if="currentQuestionData">
      <div class="card question-card shadow">
        <!--<div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
          <span class="question-number h5 mb-0">Question {{ currentQuestion }}        {{ currentQuestionData.question_title }}</span>
        </div>-->
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
        <span class="question-number h5 mb-0">
          Question {{ currentQuestion }}: {{ currentQuestionData.question_title }}
        </span>
        <span class="marks h5 mb-0">
          1 mark
        </span>
      </div>
        <div class="card-body">
          <!--<h4 class="question-title mb-3 text-dark font-weight-bold">
            {{ currentQuestionData.question_title }}
          </h4>-->
          <p 
            class="question-statement text-center mb-4 lead text-dark font-weight-bold" 
            style="
              font-size: 1.5rem; 
              font-family: 'Georgia', serif; 
              color: #333; 
              letter-spacing: 0.5px;
            "
          >
            {{ currentQuestionData.question_statement }}
          </p>
          
          <div class="options-list">
  <div class="row justify-content-center">
    <div class="col-md-10">
      <div class="row g-3">
        <div 
          v-for="(option, index) in currentQuestionData.options" 
          :key="index" 
          class="col-md-6"
        >
          <div class="form-check option-item">
            <input 
              type="radio" 
              :name="'question'+currentQuestion"
              :id="'option'+index"
              class="form-check-input"
              :value="option"
              v-model="answers[currentQuestion]"
            >
            <label 
              :for="'option'+index" 
              class="form-check-label option-label"
              style="
                font-size: 1rem; 
                font-family: 'Georgia', serif; 
                color: #333; 
                letter-spacing: 0.5px;
                display: block;
                padding: 10px 0;
                transition: color 0.3s ease;
                cursor: pointer;
              "
              :class="{ 'text-primary fw-bold': answers[currentQuestion] === option }"
            >
              {{ option }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>

    <div class="controls mt-4 d-flex justify-content-between">
      <button 
        class="btn btn-secondary" 
        @click="previousQuestion"
        :disabled="currentQuestion === 1"
      >
        <i class="fas fa-chevron-left me-2"></i>Previous
      </button>
      <button 
        class="btn btn-success" 
        @click="submitQuiz"
        v-if="currentQuestion === quiz.num_of_ques"
      >
        Submit<i class="fas fa-check ms-2"></i>
      </button>
      <button 
        class="btn btn-primary" 
        @click="nextQuestion"
        v-else
      >
        Next<i class="fas fa-chevron-right ms-2"></i>
      </button>
    </div>
  </div>
  
`,

  /*template: `
    <div class="container-fluid quiz-container">
      <div class="quiz-header d-flex justify-content-between align-items-center mb-5 p-3 rounded shadow-sm">
        <div class="quiz-info">
          <h2 class="quiz-title text-primary">{{ quiz.name }}</h2>
          <p class="quiz-subtitle text-muted">{{ quiz.chapter.subject.name }} - {{ quiz.chapter.name }}</p>
        </div>
        <div class="timer-wrapper">
          <div class="timer-container d-flex align-items-center">
            <div class="timer-icon me-3">
              <i class="fas fa-clock text-danger"></i>
            </div>
            <div class="timer-display">
              <span class="time-text">{{ formatTime(timeLeft) }}</span>
              <button 
                @click="pauseTimer" 
                class="btn btn-sm btn-outline-secondary ms-2"
              >
                <i class="fas" :class="isPaused ? 'fa-play' : 'fa-pause'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="question-menu mb-4">
        <div class="d-flex flex-wrap gap-2">
          <button 
            v-for="n in quiz.num_of_ques" 
            :key="n"
            class="btn btn-sm btn-outline-primary question-nav-btn"
            :class="{ 'active': currentQuestion === n }"
            @click="goToQuestion(n)"
          >
            {{ n }}
          </button>
        </div>
      </div>

      <div class="question-container" v-if="currentQuestionData">
        <div class="card question-card shadow-lg">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <span class="question-number">Question {{ currentQuestion }}</span>
          </div>
          <div class="card-body">
            <h4 class="question-title mb-3 text-dark">
              {{ currentQuestionData.question_title }}
            </h4>
            <p class="question-statement mb-4 lead text-dark">
              {{ currentQuestionData.question_statement }}
            </p>
            <div class="options-list">
              <div 
                v-for="(option, index) in currentQuestionData.options" 
                :key="index" 
                class="form-check option-item mb-3"
              >
                <input 
                  type="radio" 
                  :name="'question'+currentQuestion"
                  :id="'option'+index"
                  class="form-check-input"
                  :value="option"
                  v-model="answers[currentQuestion]"
                >
                <label 
                  :for="'option'+index" 
                  class="form-check-label option-label"
                >
                  {{ option }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="controls mt-4 d-flex justify-content-between">
        <button 
          class="btn btn-secondary" 
          @click="previousQuestion"
          :disabled="currentQuestion === 1"
        >
          Previous
        </button>
        <button 
          class="btn btn-success" 
          @click="submitQuiz"
          v-if="currentQuestion === quiz.num_of_ques"
        >
          Submit
        </button>
        <button 
          class="btn btn-primary" 
          @click="nextQuestion"
          v-else
        >
          Next
        </button>
      </div>
    </div>
  `,*/
  
  
  
    
  
    data() {
      return {
        quiz: null,
        questions: [],
        currentQuestion: 1,
        timeLeft: 0,
        isPaused: false,
        timer: null,
        answers: {},
        authToken: localStorage.getItem('auth-token')
      };
    },
    

    
    computed: {
      currentQuestionData() {
        return this.questions[this.currentQuestion - 1];
      }
    },
  
    methods: {
      async fetchQuizData() {
        try {
          const quizId = this.$route.params.id;
          const response = await fetch(`/api/student/quiz/${quizId}`, {
            headers: {
              'Authentication-Token': this.authToken
            }
          });
          const data = await response.json();
          this.quiz = data.quiz;
          this.questions = data.questions;
          this.initTimer();
        } catch (error) {
          console.error('Error fetching quiz:', error);
        }
      },
  
      initTimer() {
        const [hours, minutes] = this.quiz.time_duration.split(':');
        this.timeLeft = (parseInt(hours) * 3600 + parseInt(minutes) * 60);
        this.startTimer();
      },
  
      startTimer() {
        this.timer = setInterval(() => {
          if (!this.isPaused && this.timeLeft > 0) {
            this.timeLeft--;
          }
          if (this.timeLeft === 0) {
            this.submitQuiz();
          }
        }, 1000);
      },
  
      formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      },
  
      pauseTimer() {
        this.isPaused = !this.isPaused;
      },
  
      goToQuestion(n) {
        this.currentQuestion = n;
      },
  
      nextQuestion() {
        if (this.currentQuestion < this.quiz.num_of_ques) {
          this.currentQuestion++;
        }
      },
  
      previousQuestion() {
        if (this.currentQuestion > 1) {
          this.currentQuestion--;
        }
      },
  
      async submitQuiz() {
        try {
          await fetch(`/api/student/quiz/${this.quiz.id}/submit`, {
            method: 'POST',
            headers: {
              'Authentication-Token': this.authToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answers: this.answers })
          });
          this.$router.push('/');
        } catch (error) {
          console.error('Error submitting quiz:', error);
        }
      }
    },
  
    mounted() {
      this.fetchQuizData();
    },
  
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  };

 