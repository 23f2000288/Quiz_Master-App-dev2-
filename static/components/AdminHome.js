 
export default {
  template: `
  
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-xl-12">
          <div class="card" style="border-radius: 1rem;">
            <div class="card-body">
              <h3 class="text-center mb-4">Admin Dashboard - Manage Subjects and Chapters</h3>

              <!-- Add Subject Form -->
              <div class="mb-4">
                <h4>Add Subject</h4>
                <form @submit.prevent="createSubject">
                  <div class="form-outline mb-3">
                    <input v-model="newSubject.name" type="text" class="form-control" placeholder="Subject Name" required />
                  </div>
                  <div class="form-outline mb-3">
                    <textarea v-model="newSubject.description" class="form-control" placeholder="Subject Description" rows="3" required></textarea>
                  </div>
                  <button :disabled="isLoading" class="btn btn-primary">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Add Subject
                  </button>
                </form>
              </div>

              <!-- Display Subjects -->
              <div v-if="subjects.length" class="mt-5">
                <h4>Subjects</h4>
                <div class="row">
                  <div v-for="subject in subjects" :key="subject.id" class="col-md-4 mb-4">
                    <div class="card h-100">
                      <div class="card-body d-flex flex-column">
                        <h5 class="card-title">{{ subject.name }}</h5>
                        <p class="card-text">{{ subject.description }}</p>
                        <button class="btn btn-danger btn-sm mb-2" @click="deleteSubject(subject.id)">
                          Delete
                        </button>
                        <button class="btn btn-secondary btn-sm mb-2" @click="editSubject(subject)">
                          Edit
                        </button>
                        <button class="btn btn-success btn-sm" @click="fetchChapters(subject.id)">
                          Manage Chapters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Manage Chapters -->
              <div v-if="currentSubject" class="mt-5">
                <h4>Chapters for {{ currentSubject.name }}</h4>

                <!-- Add Chapter Form -->
                <div class="mb-4">
                  <h5>Add Chapter</h5>
                  <form @submit.prevent="createChapter">
                    <div class="form-outline mb-3">
                      <input v-model="newChapter.name" type="text" class="form-control" placeholder="Chapter Name" required />
                    </div>
                    <div class="form-outline mb-3">
                      <textarea v-model="newChapter.description" class="form-control" placeholder="Chapter Description" rows="3" required></textarea>
                    </div>
                    <div class="form-outline mb-3">
                      <input v-model="newChapter.num_of_ques" type="number" class="form-control" placeholder="Number of Questions" required />
                    </div>
                    <button :disabled="isLoading" class="btn btn-primary">
                      <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Add Chapter
                    </button>
                  </form>
                </div>

                <!-- List Chapters -->
                <div v-if="chapters.length">
                  <ul class="list-group">
                    <li v-for="chapter in chapters" :key="chapter.id" class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ chapter.name }}</strong>: {{ chapter.description }} ({{ chapter.num_of_ques }} questions)
                      </div>
                      <div>
                        <button class="btn btn-secondary btn-sm me-2" @click="editChapter(chapter)">Edit</button>
                        <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)">Delete</button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- No Subjects or Chapters -->
              <div v-if="!subjects.length" class="text-center mt-5">
                <p>No subjects available. Add a subject to get started.</p>
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
      newSubject: { name: '', description: '' },
      currentSubject: null,
      chapters: [],
      newChapter: { name: '', description: '', num_of_ques: null },
      isLoading: false,
      token: localStorage.getItem('auth-token'),
    };
  },

  methods: {
    async fetchSubjects() {
      try {
        const res = await fetch('/api/subjects', {
          headers: { 'Authentication-Token': this.token, 'Content-Type': 'application/json' },
        });
        if (res.ok) this.subjects = await res.json();
        else alert('Failed to fetch subjects');
      } catch (err) {
        console.error(err);
      }
    },

    async createSubject() {
      this.isLoading = true;
      try {
        const res = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Authentication-Token': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newSubject),
        });
        if (res.ok) {
          this.newSubject = { name: '', description: '' };
          await this.fetchSubjects();
        } else alert('Failed to create subject');
      } finally {
        this.isLoading = false;
      }
    },

    async deleteSubject(subjectId) {
      if (!confirm('Are you sure?')) return;
      try {
        const res = await fetch(`/api/subjects/${subjectId}`, {
          method: 'DELETE',
          headers: { 'Authentication-Token': this.token, 'Content-Type': 'application/json' },
        });
        if (res.ok) await this.fetchSubjects();
        else alert('Failed to delete subject');
      } catch (err) {
        console.error(err);
      }
    },

    async fetchChapters(subjectId) {
      try {
        const res = await fetch(`/api/chapters?subject_id=${subjectId}`, {
          headers: { 'Authentication-Token': this.token },
        });
        if (res.ok) {
          this.currentSubject = this.subjects.find((s) => s.id === subjectId);
          this.chapters = await res.json();
        } else alert('Failed to fetch chapters');
      } catch (err) {
        console.error(err);
      }
    },

    async createChapter() {
      this.isLoading = true;
      try {
        const res = await fetch('/api/chapters', {
          method: 'POST',
          headers: { 'Authentication-Token': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...this.newChapter, subject_id: this.currentSubject.id }),
        });
        if (res.ok) {
          this.newChapter = { name: '', description: '', num_of_ques: null };
          await this.fetchChapters(this.currentSubject.id);
        } else alert('Failed to create chapter');
      } finally {
        this.isLoading = false;
      }
    },

    async deleteChapter(chapterId) {
      if (!confirm('Are you sure?')) return;
      try {
        const res = await fetch(`/api/chapters/${chapterId}`, {
          method: 'DELETE',
          headers: { 'Authentication-Token': this.token },
        });
        if (res.ok) await this.fetchChapters(this.currentSubject.id);
        else alert('Failed to delete chapter');
      } catch (err) {
        console.error(err);
      }
    },

    editSubject(subject) {
      this.newSubject = { ...subject };
    },

    editChapter(chapter) {
      this.newChapter = { ...chapter };
    },
  },

  mounted() {
    this.fetchSubjects();
  },
};
