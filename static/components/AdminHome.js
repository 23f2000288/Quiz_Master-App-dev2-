
export default {
  template: `
    <div class="container my-5">
      <h1 class="text-center mb-4">Admin Dashboard</h1>

      <!-- Toggle Form Button -->
      <div class="text-center mb-4">
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? 'Close Form' : 'Create New Subject' }}
        </button>
      </div>

      <!-- Create Subject Form -->
      <div v-if="showForm" class="card shadow p-4 mb-4">
        <h3>Create a New Subject</h3>
        <form @submit.prevent="createSubject">
          <div class="mb-3">
            <label for="name" class="form-label">Subject Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="subject.name" 
              class="form-control" 
              required 
            />
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Subject Description</label>
            <textarea 
              id="description" 
              v-model="subject.description" 
              class="form-control" 
              required
            ></textarea>
          </div>

          <button type="submit" class="btn btn-success">Create Subject</button>
        </form>
      </div>

      <!-- Subjects and Chapters List -->
      <div class="row g-4">
        <div class="col-md-6" v-for="sub in subjects" :key="sub.id">
          <div class="card shadow">
            <div class="card-body">
              <h4 class="card-title">{{ sub.name }}</h4>
              <p class="card-text">{{ sub.description }}</p>

              <!-- Subject Actions -->
              <div class="d-flex justify-content-between">
                <button class="btn btn-success" @click="toggleChapterForm(sub.id)">Create Chapter</button>
                <div>
                  <button class="btn btn-danger"  @click="deleteSubject(sub.id)"><i class="bi bi-trash"></i>Delete Subject</button>
                </div>
              </div>

              <!-- Create Chapter Form -->
              <div v-if="sub.showChapterForm" class="mt-4">
                <h5>Create Chapter</h5>
                <form @submit.prevent="createChapter(sub.id)">
                  <div class="mb-3">
                    <input 
                      type="text" 
                      v-model="newChapter.chapterName" 
                      placeholder="Chapter Name" 
                      class="form-control" 
                      required 
                    />
                  </div>
                  <div class="mb-3">
                    <input 
                      type="number" 
                      v-model="newChapter.numQuestions" 
                      placeholder="Number of Questions" 
                      class="form-control" 
                      required 
                    />
                  </div>
                  <div class="mb-3">
                    <textarea 
                      v-model="newChapter.chapterDescription" 
                      placeholder="Chapter Description" 
                      class="form-control" 
                      required
                    ></textarea>
                  </div>
                  <button type="submit" class="btn btn-success">Create Chapter</button>
                </form>
              </div>

              <!-- Chapters Table -->
              <div v-if="sub.chapters.length > 0" class="mt-4">
                <h5>Chapters</h5>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Chapter Name</th>
                      <th>Questions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="chapter in sub.chapters" :key="chapter.id">
                      <td>{{ chapter.name }}</td>
                      <td>{{ chapter.num_of_ques }}</td>
                      <td>
                        <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-muted mt-2">No chapters created yet.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      showForm: false,
      subject: { name: "", description: "" },
      subjects: [],
      newChapter: { chapterName: "", numQuestions: 0, chapterDescription: "" },
    };
  },

  mounted() {
    this.fetchSubjects();
  },

  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
    },

    async fetchSubjects() {
      try {
        const res = await fetch("/api/subjects");
        if (res.ok) {
          const data = await res.json();
          this.subjects = data.map((sub) => ({
            ...sub,
            showChapterForm: false,
            chapters: [],
          }));

          // Fetch chapters for each subject
          for (const subject of this.subjects) {
            const chapterRes = await fetch(`/api/chapters?subject_id=${subject.id}`);
            if (chapterRes.ok) {
              subject.chapters = await chapterRes.json();
            }
          }
        } else {
          console.error("Failed to fetch subjects");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    },

    async createSubject() {
      try {
        const res = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.subject),
        });
        if (res.ok) {
          this.fetchSubjects();
          this.subject = { name: "", description: "" };
          this.showForm = false;
        }
      } catch (error) {
        console.error("Error creating subject:", error);
      }
    },

    toggleChapterForm(subjectId) {
      const subject = this.subjects.find((s) => s.id === subjectId);
      if (subject) subject.showChapterForm = !subject.showChapterForm;
    },

    async createChapter(subjectId) {
      try {
        const chapterData = {
          name: this.newChapter.chapterName,
          description: this.newChapter.chapterDescription,
          num_of_ques: this.newChapter.numQuestions,
          subject_id: subjectId,
        };
        const res = await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chapterData),
        });
        if (res.ok) {
          this.newChapter = { chapterName: "", numQuestions: 0, chapterDescription: "" };
          this.fetchSubjects();
        }
      } catch (error) {
        console.error("Error creating chapter:", error);
      }
    },

    async deleteSubject(subjectId) {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`, { method: "DELETE" });
        if (res.ok) {
          this.fetchSubjects();
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    },

    async deleteChapter(chapterId) {
      try {
        const res = await fetch(`/api/chapters/${chapterId}`, { method: "DELETE" });
        if (res.ok) {
          this.fetchSubjects();
        }
      } catch (error) {
        console.error("Error deleting chapter:", error);
      }
    },
  },
};
/*
export default {
  template: `
    <div class="container my-5">
      <h1 class="text-center mb-4">Admin Dashboard</h1>

      <!-- Toggle Form Button -->
      <div class="text-center mb-4">
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? 'Close Form' : 'Create New Subject' }}
        </button>
      </div>

      <!-- Create Subject Form -->
      <div v-if="showForm" class="card shadow p-4 mb-4">
        <h3>Create a New Subject</h3>
        <form @submit.prevent="createSubject">
          <div class="mb-3">
            <label for="name" class="form-label">Subject Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="subject.name" 
              class="form-control" 
              required 
            />
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Subject Description</label>
            <textarea 
              id="description" 
              v-model="subject.description" 
              class="form-control" 
              required
            ></textarea>
          </div>

          <button type="submit" class="btn btn-success">{{ editMode ? 'Update Subject' : 'Create Subject' }}</button>
        </form>
      </div>

      <!-- Subjects and Chapters List -->
      <div class="row g-4">
        <div class="col-md-6" v-for="sub in subjects" :key="sub.id">
          <div class="card shadow">
            <div class="card-body">
              <h4 class="card-title">{{ sub.name }}</h4>
              <p class="card-text">{{ sub.description }}</p>

              <!-- Subject Actions -->
              <div class="d-flex justify-content-between">
                <button class="btn btn-success" @click="toggleChapterForm(sub.id)">Create Chapter</button>
                <div>
                  <button class="btn btn-warning me-2" @click="editSubject(sub)">Edit</button>
                  <button class="btn btn-danger" @click="deleteSubject(sub.id)">Delete</button>
                </div>
              </div>

              <!-- Create Chapter Form -->
              <div v-if="sub.showChapterForm" class="mt-4">
                <h5>Create Chapter</h5>
                <form @submit.prevent="createChapter(sub.id)">
                  <div class="mb-3">
                    <input 
                      type="text" 
                      v-model="newChapter.chapterName" 
                      placeholder="Chapter Name" 
                      class="form-control" 
                      required 
                    />
                  </div>
                  <div class="mb-3">
                    <input 
                      type="number" 
                      v-model="newChapter.numQuestions" 
                      placeholder="Number of Questions" 
                      class="form-control" 
                      required 
                    />
                  </div>
                  <div class="mb-3">
                    <textarea 
                      v-model="newChapter.chapterDescription" 
                      placeholder="Chapter Description" 
                      class="form-control" 
                      required
                    ></textarea>
                  </div>
                  <button type="submit" class="btn btn-success">{{ chapterEditMode ? 'Update Chapter' : 'Create Chapter' }}</button>
                </form>
              </div>

              <!-- Chapters Table -->
              <div v-if="sub.chapters.length > 0" class="mt-4">
                <h5>Chapters</h5>
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Chapter Name</th>
                      <th>Questions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="chapter in sub.chapters" :key="chapter.id">
                      <td>{{ chapter.name }}</td>
                      <td>{{ chapter.num_of_ques }}</td>
                      <td>
                        <button class="btn btn-warning btn-sm me-2" @click="editChapter(chapter, sub.id)">Edit</button>
                        <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-muted mt-2">No chapters created yet.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      showForm: false,
      editMode: false,
      chapterEditMode: false,
      subject: { name: "", description: "" },
      editingSubjectId: null,
      newChapter: { chapterName: "", numQuestions: 0, chapterDescription: "" },
      editingChapterId: null,
      subjects: [],
    };
  },

  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
    },

    async createSubject() {
      try {
        const method = this.editMode ? "PUT" : "POST";
        const url = this.editMode ? `/api/subjects/${this.editingSubjectId}` : "/api/subjects";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.subject),
        });
        if (res.ok) {
          this.fetchSubjects();
          this.resetSubjectForm();
        }
      } catch (error) {
        console.error("Error creating/updating subject:", error);
      }
    },

    resetSubjectForm() {
      this.subject = { name: "", description: "" };
      this.editMode = false;
      this.editingSubjectId = null;
      this.showForm = false;
    },

    editSubject(subject) {
      this.subject = { name: subject.name, description: subject.description };
      this.editMode = true;
      this.editingSubjectId = subject.id;
      this.showForm = true;
    },

    async deleteSubject(subjectId) {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`, { method: "DELETE" });
        if (res.ok) {
          this.fetchSubjects();
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    },

    async createChapter(subjectId) {
      try {
        const method = this.chapterEditMode ? "PUT" : "POST";
        const url = this.chapterEditMode ? `/api/chapters/${this.editingChapterId}` : "/api/chapters";
        const chapterData = {
          name: this.newChapter.chapterName,
          description: this.newChapter.chapterDescription,
          num_of_ques: this.newChapter.numQuestions,
          subject_id: subjectId,
        };
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chapterData),
        });
        if (res.ok) {
          this.fetchSubjects();
          this.resetChapterForm();
        }
      } catch (error) {
        console.error("Error creating/updating chapter:", error);
      }
    },

    resetChapterForm() {
      this.newChapter = { chapterName: "", numQuestions: 0, chapterDescription: "" };
      this.chapterEditMode = false;
      this.editingChapterId = null;
    },

    editChapter(chapter, subjectId) {
      this.newChapter = {
        chapterName: chapter.name,
        numQuestions: chapter.num_of_ques,
        chapterDescription: chapter.description,
      };
      this.chapterEditMode = true;
      this.editingChapterId = chapter.id;
      this.toggleChapterForm(subjectId);
    },

    async deleteChapter(chapterId) {
      try {
        const res = await fetch(`/api/chapters/${chapterId}`, { method: "DELETE" });
        if (res.ok) {
          this.fetchSubjects();
        }
      } catch (error) {
        console.error("Error deleting chapter:", error);
      }
    },
  },

  mounted() {
    this.fetchSubjects();
  },
};
*/