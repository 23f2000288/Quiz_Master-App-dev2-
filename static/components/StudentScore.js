// StudentMarks.js
export default {
    template: `
      <div class="container mt-4">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Quiz Scores</h4>
          </div>
          
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
  
            <div v-else>
              <div v-if="scores.length === 0" class="text-center text-muted py-4">
                No quiz scores available
              </div>
  
              <div v-else class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Quiz Name</th>
                      <th>Date Completed</th>
                      <th class="text-end">Marks Scored</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="score in scores" :key="score.id">
                      <td>{{ score.quiz.name }}</td>
                      <td>{{ formatDate(score.timestamp) }}</td>
                      <td class="text-end fw-bold">
                        <span class="text-success">{{ score.total_scored }}</span> /
                        <span class="text-muted">{{ score.quiz.num_of_ques }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        scores: [],
        loading: true,
        authToken: localStorage.getItem('auth-token')
      }
    },
  
    methods: {
      formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
  
      async fetchScores() {
        try {
          const response = await fetch('/api/student/scores', {
            headers: {
              'Authentication-Token': this.authToken,
              'Content-Type': 'application/json'
            }
          })
          
          if (!response.ok) throw new Error('Failed to fetch scores')
          this.scores = await response.json()
          
        } catch (error) {
          console.error('Error fetching scores:', error)
          this.scores = []
        } finally {
          this.loading = false
        }
      }
    },
  
    mounted() {
      this.fetchScores()
    }
  }
  