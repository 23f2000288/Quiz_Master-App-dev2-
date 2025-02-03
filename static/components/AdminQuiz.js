
export default {
  template: `
   <div class="container-fluid d-flex flex-column py-5" style="background: linear-gradient(to bottom, rgb(255, 170, 29), rgb(255, 170, 29)); height: 100vh;"> 
      <div class="row d-flex justify-content-center align-items-start h-100">
        <div class="col col-xl-12">
          <div class="card" style="border-radius: 1rem; min-height: 80vh;">
            <div class="card-body d-flex flex-column">
              <h3 class="text-center mb-4" style="font-family: 'Georgia', serif; color: #3c3c3c;">
                Quiz Management
              </h3>

              <!-- Display Chapters -->
              <div v-if="chapters.length > 0" class="mt-5">
                <h4 style="font-family: 'Georgia', serif; color: #3c3c3c;">Chapters</h4>
                <div class="row">
                  <div v-for="chapter in chapters" :key="chapter.id" class="col-md-6 mb-4">
                    <div class="card h-100" style="height: 300px;">
                      <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-center fw-bold" style="font-family: 'Georgia', serif; color: #3c3c3c;">
                          {{ chapter.name }}
                        </h5>
                        <p class="card-text text-center" style="font-family: 'Georgia', serif; color: #3c3c3c;">
                          {{ chapter.description }}
                        </p>

                        <!-- Quizzes -->
                        <div class="mt-3">
                          <h6 class="text-primary" v-if="chapter.quizzes?.length">Quizzes</h6>
                          <div class="card-deck" v-if="chapter.quizzes?.length">
                            <div v-for="quiz in chapter.quizzes" :key="quiz.id" class="card mb-3" style="min-width: 18rem;">
                              <div class="card-body">
                                <h5 class="card-title text-center">{{ quiz.name }}</h5>
                                <p class="card-text text-center">
                                  <strong>Duration:</strong> {{ quiz.time_duration }} mins
                                </p>
                                <p class="card-text text-center">
                                  <strong>Number of ques:</strong> {{ quiz.num_of_ques || 'N/A' }}
                                </p>
                                <p class="card-text text-center">
                                  <strong>Remarks:</strong> {{ quiz.remarks }}
                                </p>
                                <div class="d-flex justify-content-around">
                                  <button class="btn btn-warning btn-sm" @click="editQuiz(quiz)">
                                    <i class="fa fa-edit"></i> Edit
                                  </button>
                                  <button class="btn btn-danger btn-sm" @click="deleteQuiz(quiz.id)">
                                    <i class="fa fa-trash"></i> Delete
                                  </button>
                                  <button class="btn btn-primary btn-sm" @click="openQuestionModal(quiz.id)">
                                    <i class="fa fa-plus"></i> Add Question
                                  </button>
                                </div>
                                <div class="mt-3">
                                  <h6 class="text-secondary">Questions:</h6>
                                  <ul class="list-unstyled" v-if="quiz.questions?.length">
                                    <li v-for="question in quiz.questions" :key="question.id" class="mb-2">
                                      <strong>{{ question.question_title }}:</strong> {{ question.question_statement }}
                                      <div class="mt-1">
                                        <button class="btn btn-warning btn-sm mr-1" @click="editQuestion(quiz.id, question)">
                                          <i class="fa fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-danger btn-sm" @click="deleteQuestion(quiz.id, question.id)">
                                          <i class="fa fa-trash"></i> Delete
                                        </button>
                                      </div>
                                    </li>
                                  </ul>
                                  <p v-else class="text-muted">No questions available for this quiz.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div v-else class="text-center mt-3 text-muted">
                            No quizzes available for this chapter.
                          </div>
                        </div>

                        <!-- Add Quiz Button -->
                        <button v-if="!chapter.quizzes?.length" class="btn btn-primary btn-sm mt-auto" @click="openQuizModal(chapter.id)"
                                style="font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 20px;">
                          <i class="fa fa-plus"></i> Add Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Chapters Available -->
              <div v-if="!chapters.length" class="text-center mt-5">
                <p>No chapters available. Add a chapter to get started.</p>
              </div>

              <!-- Quiz Modal -->
              <div v-if="showQuizModal" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Add/Edit Quiz</h5>
                      <button type="button" class="close" @click="closeQuizModal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <form @submit.prevent="submitQuiz">
                        <div class="form-outline mb-3">
                          <input v-model="quizForm.name" type="text" class="form-control" placeholder="Quiz Name" required />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="quizForm.time_duration" type="text" class="form-control" placeholder="Duration (HH:MM)" required />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="quizForm.num_of_ques" type="int" class="form-control" placeholder="Num of Ques" required />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="quizForm.remarks" type="text" class="form-control" placeholder="Remarks" required />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="quizForm.date_of_quiz" type="date" class="form-control" placeholder="Date" required />
                        </div>
                        <button :disabled="isLoading" class="btn btn-primary">
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          {{ isEditingQuiz ? 'Update Quiz' : 'Add Quiz' }}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Question Modal -->
              <div v-if="showQuestionModal" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Add/Edit Question</h5>
                      <button type="button" class="close" @click="closeQuestionModal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <form @submit.prevent="submitQuestion">
                        <div class="form-outline mb-3">
                          <input v-model="questionForm.question_title" type="text" class="form-control" placeholder="Question Title" required />
                        </div>
                        <div class="form-outline mb-3">
                          <textarea v-model="questionForm.question_statement" class="form-control" placeholder="Question Statement" required></textarea>
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="questionForm.option1" type="text" class="form-control" placeholder="Option 1" required />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="questionForm.option2" type="text" class="form-control" placeholder="Option 2" required />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="questionForm.option3" type="text" class="form-control" placeholder="Option 3" />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="questionForm.option4" type="text" class="form-control" placeholder="Option 4" />
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="questionForm.correct_option" type="text" class="form-control" placeholder="Correct Option" required />
                        </div>
                        <button :disabled="isLoading" class="btn btn-primary">
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          {{ isEditingQuestion ? 'Update Question' : 'Add Question' }}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      chapters: [],
      quizForm: { name: '', time_duration: '', chapter_id: '', remarks: '', date_of_quiz: '', num_of_ques: '' },
      questionForm: { question_title: '', question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_option: '' },
      isLoading: false,
      showQuizModal: false,
      showQuestionModal: false,
      isEditingQuiz: false,
      isEditingQuestion: false,
      currentQuizId: null,
      token: localStorage.getItem('auth-token'),
    };
  },

  methods: {
    async fetchChapters() {
      try {
        const response = await fetch('/api/chapters', {
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });
    
        const data = await response.json();
        this.chapters = data.map(chapter => ({
          ...chapter,
          quizzes: []
        }));
    
        await Promise.all(this.chapters.map(async (chapter) => {
          const quizResponse = await fetch(`/api/quizzes/${chapter.id}`, {
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json',
            },
          });
    
          if (quizResponse.ok) {
            const quizzes = await quizResponse.json();
            const quizzesWithQuestions = await Promise.all(quizzes.map(async (quiz) => {
              const questionResponse = await fetch(`/api/quizzes/${quiz.id}/questions`, {
                headers: {
                  'Authentication-Token': this.token,
                  'Content-Type': 'application/json',
                },
              });
              const questions = await questionResponse.json();
              return { ...quiz, questions: Array.isArray(questions) ? questions : [] };
            }));
            this.$set(chapter, 'quizzes', quizzesWithQuestions);
          }
        }));
      } catch (error) {
        console.error('Failed to fetch chapters and quizzes:', error);
      }
    },

    openQuestionModal(quizId) {
      this.questionForm = { 
        question_title: '', 
        question_statement: '', 
        option1: '', 
        option2: '', 
        option3: '', 
        option4: '', 
        correct_option: '' 
      };
      this.currentQuizId = quizId;
      this.showQuestionModal = true;
      this.isEditingQuestion = false;
    },

    closeQuestionModal() {
      this.showQuestionModal = false;
    },

    editQuestion(quizId, question) {
      this.questionForm = { 
        id: question.id,
        question_title: question.question_title,
        question_statement: question.question_statement,
        option1: question.options.option1 || '',
        option2: question.options.option2 || '',
        option3: question.options.option3 || '',
        option4: question.options.option4 || '',
        correct_option: question.correct_option
      };
      this.currentQuizId = quizId;
      this.isEditingQuestion = true;
      this.showQuestionModal = true;
    },

    async submitQuestion() {
      this.isLoading = true;
      try {
        const url = this.isEditingQuestion
          ? `/api/quizzes/${this.currentQuizId}/questions/${this.questionForm.id}`
          : `/api/quizzes/${this.currentQuizId}/questions`;
        const method = this.isEditingQuestion ? 'PUT' : 'POST';
    
        const questionData = {
          question_title: this.questionForm.question_title,
          question_statement: this.questionForm.question_statement,
          options: {
            option1: this.questionForm.option1,
            option2: this.questionForm.option2,
            option3: this.questionForm.option3,
            option4: this.questionForm.option4
          },
          correct_option: this.questionForm.correct_option
        };
    
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(questionData),
        });
    
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} ${response.statusText} - ${errorMessage}`);
        }
    
        console.log('Question submitted successfully.');
        this.closeQuestionModal();
        await this.fetchChapters();
      } catch (error) {
        console.error('Failed to submit question:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchQuestions(quizId) {
      try {
        const response = await fetch(`/api/quizzes/${quizId}/questions`, {
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });
    
        if (response.ok) {
          const questions = await response.json();
          this.chapters.forEach(chapter => {
            const quiz = chapter.quizzes.find(q => q.id === quizId);
            if (quiz) {
              this.$set(quiz, 'questions', questions);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    },

    async deleteQuestion(quizId, questionId) {
      if (!confirm('Are you sure you want to delete this question?')) return;
    
      try {
        const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
    
        if (response.ok) {
          await this.fetchChapters();
        }
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    },
    openQuizModal(chapterId) {
      this.quizForm = { name: '', time_duration: '', remarks: '', date_of_quiz: '', num_of_ques: '', chapter_id: chapterId };
      this.currentQuizId = chapterId;
      this.showQuizModal = true;
      this.isEditingQuiz = false;
    },

    closeQuizModal() {
      this.showQuizModal = false;
    },

    async submitQuiz() {
      this.isLoading = true;
      try {
        const url = this.isEditingQuiz
          ? `/api/quizzes/${this.quizForm.id}/update`
          : `/api/quizzes/${this.quizForm.chapter_id}`;
        const method = this.isEditingQuiz ? 'PUT' : 'POST';
    
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(this.quizForm),
        });
    
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} ${response.statusText} - ${errorMessage}`);
        }
    
        console.log('Quiz submitted successfully.');
        this.closeQuizModal();
        await this.fetchChapters();
      } catch (error) {
        console.error('Failed to submit quiz:', error);
      } finally {
        this.isLoading = false;
      }
    },

    editQuiz(quiz) {
      this.quizForm = { ...quiz };
      this.isEditingQuiz = true;
      this.showQuizModal = true;
    },

    async deleteQuiz(quizId) {
      if (!confirm('Are you sure you want to delete this quiz?')) return;
      try {
        const response = await fetch(`/api/quizzes/${quizId}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
    
        if (response.ok) {
          alert('Quiz deleted successfully.');
          await this.fetchChapters();
        } else {
          const errorText = await response.text();
          alert(`Failed to delete quiz: ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        alert('An error occurred while trying to delete the quiz.');
      }
    },

    // Other methods (quiz-related) remain the same as in your paste-3.txt
  },

  mounted() {
    this.fetchChapters();
  },
};

