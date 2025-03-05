
export default {
  
  template: `
    <div class="container-fluid d-flex flex-column py-5" 
      style="background: linear-gradient(to bottom, rgb(255, 170, 29), rgb(255, 170, 29)); ">
      <div class="row d-flex justify-content-center align-items-start h-100">
        <div class="col col-xl-12">
          <div class="card" style="border-radius: 1rem; min-height: 80vh;">
            <div class="card-body d-flex flex-column">
              <h3 class="text-center mb-4" style="font-family: 'Georgia', serif; color: #3c3c3c;">Subject and Chapter Management</h3>

              <!-- Add Subject Button -->
              <div class="justify-content-center mb-4">
                <button class="justify-content-center btn btn-primary rounded-pill" @click="openModal" 
                  style="font-size: 1rem; padding: 0.5rem 1.5rem; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <i class="fa fa-plus"></i> Add Subject
                </button>
              </div>

              <!-- Search Box -->
              <div class="mb-3">
                <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="Search subjects or chapters..."
                />
              </div>

              <!-- Display Subjects -->
              <div v-if="filteredSubjects.length" class="mt-5">
                <h4 style="font-family: 'Georgia', serif; color: #3c3c3c;">Subjects</h4>
                <div class="row">
                  <div v-for="subject in filteredSubjects" :key="subject.id" class="col-md-6 mb-4">
                    <div class="card h-100" style="height: 300px;">
                      <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-center fw-bold" style="font-family: 'Georgia', serif; color: #3c3c3c;">{{ subject.name }}</h5>
                        <p class="card-text text-center" style="font-family: 'Georgia', serif; color: #3c3c3c;">{{ subject.description }}</p>
                        <button class="btn btn-danger btn-sm mb-2" @click="deleteSubject(subject.id)" 
                          style="font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 20px;">
                          <i class="fa fa-trash"></i> Delete
                        </button>
                        <button class="btn btn-secondary btn-sm mb-2" @click="editSubject(subject)" 
                          style="font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 20px;">
                          <i class="fa fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-info btn-sm mt-auto" @click="openChapterModal(subject.id)" 
                          style="font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 20px;">
                          <i class="bi bi-book"></i> Manage Chapters
                        </button>
                        
                        <!-- Display Chapters for the Subject -->
                        <div v-if="subject.chapters && subject.chapters.length" class="mt-3">
                          <h6 class="text-primary">Chapters</h6>
                          <div class="card-deck">
                            <div v-for="chapter in subject.chapters" :key="chapter.id" class="card mb-3" style="min-width: 18rem;">
                              <div class="card-body">
                                <h5 class="card-title text-center">{{ chapter.name }}</h5>
                                <p class="card-text">{{ chapter.description }}</p>
                                <div class="d-flex justify-content-around">
                                  <button class="btn btn-warning btn-sm" @click="editChapter(chapter)">
                                    <i class="fa fa-edit"></i> Edit
                                  </button>
                                  <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)">
                                    <i class="fa fa-trash"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Subjects Available -->
              <div v-if="!filteredSubjects.length && subjects.length" class="text-center mt-5">
                <p>No subjects or chapters match the search query.</p>
              </div>
              <div v-if="!subjects.length" class="text-center mt-5">
                <p>No subjects available. Add a subject to get started.</p>
              </div>

              <!-- Modal for Creating/Editing Subject -->
              <div v-if="showModal" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">{{ subjectForm.id ? 'Edit Subject' : 'Add Subject' }}</h5>
                      <button type="button" class="close" @click="closeModal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <form @submit.prevent="subjectForm.id ? updateSubject() : createSubject()">
                        <div class="form-outline mb-3">
                          <input v-model="subjectForm.name" type="text" class="form-control" placeholder="Subject Name" required />
                        </div>
                        <div class="form-outline mb-3">
                          <textarea v-model="subjectForm.description" class="form-control" placeholder="Subject Description" rows="3" required></textarea>
                        </div>
                        <button :disabled="isLoading" class="btn btn-primary">
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          {{ subjectForm.id ? 'Update Subject' : 'Add Subject' }}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Modal for Managing Chapters -->
              <div v-if="showChapterModal" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Manage Chapters</h5>
                      <button type="button" class="close" @click="closeChapterModal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                     
                      <form @submit.prevent="createOrUpdateChapter">
                        <!-- form inputs -->
                        <div class="form-outline mb-3">
                          <input v-model="chapterForm.name" type="text" class="form-control" placeholder="Chapter Name" required />
                        </div>
                        <div class="form-outline mb-3">
                          <textarea v-model="chapterForm.description" class="form-control" placeholder="Chapter Description" rows="3" required></textarea>
                        </div>
                        <button :disabled="isLoading" class="btn btn-primary">
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          {{ chapterForm.id ? 'Update Chapter' : 'Add Chapter' }}
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
      subjects: [],
      subjectForm: { name: '', description: '' },
      chapterForm: { name: '', description: '', subject_id: '' },
      isLoading: false,
      showModal: false,
      showChapterModal: false,
      token: localStorage.getItem('auth-token'),
      currentSubjectId: null,
      searchQuery: '',
    };
  },

  computed: {
    filteredSubjects() {
      const query = this.searchQuery.toLowerCase();
      return this.subjects.filter(subject => {
        const subjectMatch = subject.name.toLowerCase().includes(query) ||
                              subject.description.toLowerCase().includes(query);

        const chapterMatch = subject.chapters && subject.chapters.some(chapter =>
          chapter.name.toLowerCase().includes(query) ||
          chapter.description.toLowerCase().includes(query)
        );

        return subjectMatch || chapterMatch;
      });
    },
  },

  methods: {
    openModal() {
      this.subjectForm = { name: '', description: '' };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    openChapterModal(subjectId) {
      this.currentSubjectId = subjectId;
      this.chapterForm = { name: '', description: '', subject_id: subjectId };
      this.showChapterModal = true;
    },

    closeChapterModal() {
      this.showChapterModal = false;
    },

    async fetchSubjects() {
      try {
        const res = await fetch('/api/subjects', {
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          this.subjects = await res.json();
          for (let subject of this.subjects) {
            const chapterRes = await fetch(`/api/chapters?subject_id=${subject.id}`, {
              headers: {
                'Authentication-Token': this.token,
                'Content-Type': 'application/json',
              },
            });
            if (chapterRes.ok) {
              subject.chapters = await chapterRes.json();
            } else {
              subject.chapters = [];
            }
          }
        } else {
          alert('Failed to fetch subjects');
        }
      } catch (err) {
        console.error(err);
      }
    },

    async createSubject() {
      if (!this.token) {
        alert('Please log in first');
        return;
      }

      this.isLoading = true;

      try {
        const res = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.subjectForm),
        });

        if (res.ok) {
          this.subjectForm = { name: '', description: '' };
          await this.fetchSubjects();
          this.closeModal();
        } else {
          const errorResponse = await res.json();
          alert(`Failed to create subject: ${errorResponse.message || 'Unknown error'}`);
        }
      } finally {
        this.isLoading = false;
      }
    },

    async updateSubject() {
      if (!this.token) {
        alert('Please log in first');
        return;
      }

      this.isLoading = true;

      try {
        const res = await fetch(`/api/subjects/${this.subjectForm.id}`, {
          method: 'PUT',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.subjectForm.name,
            description: this.subjectForm.description
          }),
        });

        if (res.ok) {
          const data = await res.json();
          alert(data.message);
          this.closeModal();
          await this.fetchSubjects();
        } else {
          const errorResponse = await res.json();
          alert(`Failed to update subject: ${errorResponse.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while updating the subject');
      } finally {
        this.isLoading = false;
      }
    },

    async deleteSubject(subjectId) {
      if (!confirm('Are you sure?')) return;
      try {
        const res = await fetch(`/api/subjects/${subjectId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          await this.fetchSubjects();
        } else {
          alert('Failed to delete subject');
        }
      } catch (err) {
        console.error(err);
      }
    },

    editSubject(subject) {
      this.subjectForm = { ...subject };
      this.showModal = true;
    },

    async createOrUpdateChapter() {
      if (!this.token) {
        alert('Please log in first');
        return;
      }

      this.isLoading = true;

      try {
        const method = this.chapterForm.id ? 'PUT' : 'POST';
        const url = this.chapterForm.id ? `/api/chapters/${this.chapterForm.id}` : '/api/chapters';

        const res = await fetch(url, {
          method: method,
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.chapterForm),
        });

        if (res.ok) {
          this.chapterForm = { id: null, name: '', description: '', subject_id: this.currentSubjectId };
          this.closeChapterModal();
          await this.fetchSubjects();
        } else {
          const errorResponse = await res.json();
          alert(`Failed to ${this.chapterForm.id ? 'update' : 'create'} chapter: ${errorResponse.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        alert(`An error occurred while ${this.chapterForm.id ? 'updating' : 'creating'} the chapter`);
      } finally {
        this.isLoading = false;
      }
    },

    async deleteChapter(chapterId) {
      if (!confirm('Are you sure?')) return;
      try {
        const res = await fetch(`/api/chapters/${chapterId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          await this.fetchSubjects();
        } else {
          alert('Failed to delete chapter');
        }
      } catch (err) {
        console.error(err);
      }
    },

    editChapter(chapter) {
      this.chapterForm = { ...chapter };
      this.chapterForm.subject_id = this.currentSubjectId;
      this.showChapterModal = true;
    },
  },

  mounted() {
    this.fetchSubjects();
  },
};

