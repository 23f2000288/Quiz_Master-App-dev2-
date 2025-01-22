
export default {
  template: `
    <div class="container-fluid d-flex flex-column py-5" 
    style="background: linear-gradient(to bottom, rgb(255, 170, 29), rgb(255, 170, 29)); height: 100vh;">
  <div class="row d-flex justify-content-center align-items-start h-100">
    <div class="col col-xl-12">
      <div class="card" style="border-radius: 1rem; min-height: 80vh;">
        <div class="card-body d-flex flex-column">
              <h3 class="text-center mb-4">Subject and Chapter managment</h3>

              <!-- Add Subject Button -->
              <div class="mb-4">
                <button class="btn btn-primary" @click="openModal">Add Subject</button>
              </div>

              <!-- Display Subjects -->
              <div v-if="subjects.length" class="mt-5">
                <h4>Subjects</h4>
                <div class="row">
                  <div v-for="subject in subjects" :key="subject.id" class="col-md-6 mb-4">
                    <div class="card h-100" style="height: 300px;">
                      <div class="card-body d-flex flex-column">
                        <h5 class="card-title">{{ subject.name }}</h5>
                        <p class="card-text">{{ subject.description }}</p>
                        <button class="btn btn-danger btn-sm mb-2" @click="deleteSubject(subject.id)" style="font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 20px;">
                          Delete
                        </button>

                        <button class="btn btn-secondary btn-sm mb-2" @click="editSubject(subject)" style="font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 20px;">
                          Edit
                        </button>

                        <!-- Button to open chapter modal -->
                        <button class="btn btn-info btn-sm mt-auto" @click="openChapterModal(subject.id)" style="font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 20px;">
                          Manage Chapters
                        </button>


                        <!-- Display Chapters for the Subject -->
                        <div v-if="subject.chapters && subject.chapters.length" class="mt-3">
                          <h6>Chapters</h6>
                          <ul>
                            <li v-for="chapter in subject.chapters" :key="chapter.id">
                              {{ chapter.name }} 
                               {{chapter.num_of_ques}}
                               {{chapter.description}}
                              <button class="btn btn-warning btn-sm" @click="editChapter(chapter)">Edit</button>
                              <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)">Delete</button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Subjects Available -->
              <div v-if="!subjects.length" class="text-center mt-5">
                <p>No subjects available. Add a subject to get started.</p>
              </div>

              <!-- Modal for Creating Subject -->
              <div v-if="showModal" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Add Subject</h5>
                      <button type="button" class="close" @click="closeModal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <form @submit.prevent="createSubject">
                        <div class="form-outline mb-3">
                          <input v-model="subjectForm.name" type="text" class="form-control" placeholder="Subject Name" required />
                        </div>
                        <div class="form-outline mb-3">
                          <textarea v-model="subjectForm.description" class="form-control" placeholder="Subject Description" rows="3" required></textarea>
                        </div>
                        <button :disabled="isLoading" class="btn btn-primary">
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Add Subject
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
                      <form @submit.prevent="createChapter">
                        <div class="form-outline mb-3">
                          <input v-model="chapterForm.name" type="text" class="form-control" placeholder="Chapter Name" required />
                        </div>
                        <div class="form-outline mb-3">
                          <textarea v-model="chapterForm.description" class="form-control" placeholder="Chapter Description" rows="3" required></textarea>
                        </div>
                        <div class="form-outline mb-3">
                          <input v-model="chapterForm.num_of_ques" type="number" class="form-control" placeholder="Number of Questions" required />
                        </div>
                        <button :disabled="isLoading" class="btn btn-primary">
                          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Add Chapter
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
      chapterForm: { name: '', description: '', num_of_ques: '', subject_id: '' },
      isLoading: false,
      showModal: false,
      showChapterModal: false,
      token: localStorage.getItem('auth-token'),
      currentSubjectId: null, // Track which subject the user is managing chapters for
    };
  },

  methods: {
    // Open the modal to create a new subject
    openModal() {
      console.log("Opening Modal...");
      this.subjectForm = { name: '', description: '' };  // Reset the form
      this.showModal = true;  // Show modal
    },

    // Close the modal for creating subject
    closeModal() {
      console.log("Closing Modal...");
      this.showModal = false;  // Hide modal
    },

    // Open the modal for managing chapters for a specific subject
    openChapterModal(subjectId) {
      this.currentSubjectId = subjectId;
      this.chapterForm = { name: '', description: '', num_of_ques: '', subject_id: subjectId };  // Reset form with subject ID
      this.showChapterModal = true;  // Show chapter modal
    },

    // Close the modal for managing chapters
    closeChapterModal() {
      this.showChapterModal = false;  // Hide chapter modal
    },

    // Fetch all subjects with their chapters
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
          // Fetch chapters for each subject
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

    // Create a new subject
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
          this.subjectForm = { name: '', description: '' }; // Reset form
          await this.fetchSubjects(); // Refresh the subjects list
          this.closeModal(); // Close the modal
        } else {
          const errorResponse = await res.json();
          alert(`Failed to create subject: ${errorResponse.message || 'Unknown error'}`);
        }
      } finally {
        this.isLoading = false;
      }
    },

    // Delete a subject
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

    // Edit an existing subject
    editSubject(subject) {
      this.subjectForm = { ...subject };
      this.showModal = true;
    },

    // Create a new chapter for a subject
    async createChapter() {
      if (!this.token) {
        alert('Please log in first');
        return;
      }

      this.isLoading = true;

      try {
        const res = await fetch('/api/chapters', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.chapterForm),
        });

        if (res.ok) {
          this.chapterForm = { name: '', description: '', num_of_ques: '', subject_id: this.currentSubjectId };
          this.closeChapterModal();
          await this.fetchSubjects(); // Refresh subjects and chapters
        } else {
          const errorResponse = await res.json();
          alert(`Failed to create chapter: ${errorResponse.message || 'Unknown error'}`);
        }
      } finally {
        this.isLoading = false;
      }
    },

    // Edit a chapter
    editChapter(chapter) {
      this.chapterForm = { ...chapter };
      this.chapterForm.subject_id = this.currentSubjectId;
      this.showChapterModal = true;
    },

    // Delete a chapter
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
          await this.fetchSubjects(); // Refresh the subjects list
        } else {
          alert('Failed to delete chapter');
        }
      } catch (err) {
        console.error(err);
      }
    },
  },

  mounted() {
    this.fetchSubjects(); // Load subjects and chapters when the component is mounted
  },
};

