
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
              <div v-if="chapters.length" class="mt-5">
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
                        <div v-if="chapter.quizzes" class="mt-3">
                          <h6 class="text-primary">Quizzes</h6>
                          <div class="card-deck">
                            <div v-for="quiz in chapter.quizzes" :key="quiz.id" class="card mb-3" style="min-width: 18rem;">
                              <div class="card-body">
                                <h5 class="card-title text-center">{{ quiz.name }}</h5>
                                <p class="card-text text-center">
                                  <strong>Duration:</strong> {{ quiz.time_duration }} mins
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
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-center mt-3 text-muted">
                          No quizzes available for this chapter.
                        </div>

                        <!-- Add Quiz Button -->
                        <button class="btn btn-primary btn-sm mt-auto" @click="openQuizModal(chapter.id)"
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
      quizForm: { name: '', time_duration: '', chapter_id: '', remarks: '', date_of_quiz: '' },
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
        this.chapters = data;

        // Fetch quizzes for each chapter
        for (const chapter of this.chapters) {
          const quizResponse = await fetch(`/api/quizzes/${chapter.id}`, {
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json',
            },
          });

          if (quizResponse.ok) {
            chapter.quizzes = await quizResponse.json();
          } else {
            chapter.quizzes = []; // No quizzes for this chapter
          }
        }
      } catch (error) {
        console.error('Failed to fetch chapters and quizzes:', error);
      }
    },

    openQuizModal(chapterId) {
      this.quizForm = { name: '', time_duration: '', remarks: '', date_of_quiz: '', chapter_id: chapterId };
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
          ? `/api/quizzes/${this.quizForm.id}`
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
        await this.fetchChapters(); // Refresh the chapter list and quizzes
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
        const response = await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });

        if (response.ok) {
          alert('Quiz deleted successfully.');
          await this.fetchChapters(); // Refresh the chapters to reflect the deletion
        } else {
          const errorText = await response.text();
          alert(`Failed to delete quiz: ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        alert('An error occurred while trying to delete the quiz.');
      }
    },

    openQuestionModal(quizId) {
      this.questionForm = { question_title: '', question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_option: '' };
      this.currentQuizId = quizId;
      this.showQuestionModal = true;
      this.isEditingQuestion = false;
    },

    closeQuestionModal() {
      this.showQuestionModal = false;
    },

    async submitQuestion() {
      this.isLoading = true;
      try {
        const url = this.isEditingQuestion
          ? `/api/questions/${this.questionForm.id}`
          : `/api/quizzes/${this.currentQuizId}/questions`;
        const method = this.isEditingQuestion ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(this.questionForm),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} ${response.statusText} - ${errorMessage}`);
        }

        console.log('Question submitted successfully.');
        this.closeQuestionModal();
        await this.fetchChapters(); // Refresh the chapter list and questions
      } catch (error) {
        console.error('Failed to submit question:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async deleteQuestion(questionId) {
      if (!confirm('Are you sure you want to delete this question?')) return;

      try {
        const response = await fetch(`/api/questions/${questionId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });

        if (response.ok) {
          alert('Question deleted successfully.');
          await this.fetchChapters(); // Refresh the chapters to reflect the deletion
        } else {
          const errorText = await response.text();
          alert(`Failed to delete question: ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to delete question:', error);
        alert('An error occurred while trying to delete the question.');
      }
    },
  },

  mounted() {
    this.fetchChapters();
  },
};

