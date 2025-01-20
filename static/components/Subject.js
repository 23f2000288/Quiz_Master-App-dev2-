/*export default {
    template: `
      <div>
        <h2>Create a New Subject</h2>
        <form @submit.prevent="createSubject">
          <div>
            <label for="name">Subject Name</label>
            <input type="text" id="name" v-model="subject.name" required />
          </div>
  
          <div>
            <label for="description">Subject Description</label>
            <textarea id="description" v-model="subject.description" required></textarea>
          </div>
  
          <div>
            <button type="submit">Create Subject</button>
          </div>
        </form>
  
        <h2>Subject List</h2>
        <ul>
          <li v-for="sub in subjects" :key="sub.id">{{ sub.name }}: {{ sub.description }}</li>
        </ul>
      </div>
    `,
  
    data() {
      return {
        subject: {
          name: '',
          description: ''
        },
        subjects: []
      };
    },
  
    mounted() {
      this.fetchSubjects();
    },
  
    methods: {
      // Method to fetch subjects from the backend
      async fetchSubjects() {
        try {
          const res = await fetch('/api/subjects');
          if (res.ok) {
            const data = await res.json();
            this.subjects = data;
          } else {
            alert('Error fetching subjects');
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
        }
      },
  
      // Method to create a new subject
      async createSubject() {
        const res = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.subject)
        });
  
        if (res.ok) {
          alert('Subject created successfully!');
          this.fetchSubjects(); // Reload the list after creating a new subject
          this.subject.name = ''; // Clear the input field
          this.subject.description = ''; // Clear the input field
        } else {
          const error = await res.json();
          alert(`Subject creation failed: ${error.message}`);
        }
      }
    }
  };
*/
