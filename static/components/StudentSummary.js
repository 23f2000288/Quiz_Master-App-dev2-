export default {
    template: `
    <div class="student-summary container mt-4">
        
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <div v-else>
            <div class="row">
                <div class="col-md-6">
                    <h3>Total Scores per Quiz</h3>
                    <canvas ref="scoreChart"></canvas>
                </div>
                <div class="col-md-6">
                    <h3>Quizzes per Chapter</h3>
                    <canvas ref="chapterChart"></canvas>
                </div>
            </div>
            <!-- Add Export Button Here -->
            <button
                class="btn btn-primary"
                @click="exportData"
                :disabled="exporting || downloading"
            >
                <span v-if="exporting">Exporting... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></span>
                <span v-else-if="downloading">Downloading...</span>
                <span v-else>Export Quiz Data</span>
            </button>
            <div v-if="exportStatusMessage" class="mt-2 alert" :class="{'alert-success': exportSuccess, 'alert-success': !exportSuccess}" role="alert">
                {{ exportStatusMessage }}
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            scoresPerQuiz: [],
            quizzesPerChapter: [],
            loading: true,
            error: null,
            scoreChartInstance: null,
            chapterChartInstance: null,
            exporting: false,
            downloading: false,
            exportStatusMessage: null,
            exportSuccess: false,
        };
    },
    mounted() {
        this.fetchStudentSummary();
    },
    methods: {
        async fetchStudentSummary() {
            try {
                const response = await fetch('/api/student/summary', {
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('API Response:', data);
                this.scoresPerQuiz = data.scores_per_quiz;
                this.quizzesPerChapter = data.quizzes_per_chapter;
                this.$nextTick(() => {
                    this.createScoreChart();
                    this.createChapterChart();
                });

            } catch (error) {
                console.error('Error fetching student summary:', error);
                this.error = 'Failed to load student summary. Please try again later.';
            } finally {
                this.loading = false;
            }
        },

        createScoreChart() {
            this.$nextTick(() => {
                const ctx = this.$refs.scoreChart;
                if (!ctx) {
                    console.error('Cannot find scoreChart element');
                    return;
                }

                if (this.scoreChartInstance) {
                    this.scoreChartInstance.destroy();
                }

                this.scoreChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: this.scoresPerQuiz.map(item => item.quiz),
                        datasets: [{
                            label: 'Total Score',
                            data: this.scoresPerQuiz.map(item => item.total_score),
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Total Score'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Quiz'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Total Score per Quiz'
                            }
                        }
                    }
                });
            });
        },

        createChapterChart() {
            this.$nextTick(() => {
                const ctx = this.$refs.chapterChart;
                if (!ctx) {
                    console.error('Cannot find chapterChart element');
                    return;
                }

                if (this.chapterChartInstance) {
                    this.chapterChartInstance.destroy();
                }

                this.chapterChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: this.quizzesPerChapter.map(item => item.chapter),
                        datasets: [{
                            label: 'Number of Quizzes',
                            data: this.quizzesPerChapter.map(item => item.quiz_count),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Quizzes'
                                },
                                ticks: {
                                    stepSize: 1
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Chapter'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Quizzes per Chapter'
                            }
                        }
                    }
                });
            });
        },
        async exportData() {
            this.exporting = true;
            this.exportSuccess = false;
            this.exportStatusMessage = 'Preparing export...';
        
            try {
                const response = await fetch('/download-csv', {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                    },
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
                const data = await response.json();
                const taskId = data.task_id;
                this.exportStatusMessage = 'Export task started. Checking status...';
                this.checkExportStatus(taskId);
            } catch (error) {
                console.error('Error triggering export:', error);
                this.exportStatusMessage = 'Failed to trigger export. Please try again later.';
                this.exportSuccess = false;
            } finally {
                this.exporting = false;
            }
        },
        
        async checkExportStatus(taskId) {
            try {
                const response = await fetch(`/get-csv/${taskId}`, { 
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                       this.exportStatusMessage = 'Export not found.  It may have expired.';
                    } else {
                      throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    this.exportSuccess = false;
                    return; 
                }

                

                if (response.headers.get('Content-Type') === 'application/json') {
                    const data = await response.json();
                    if (data.status === 'pending') {
                        this.exportStatusMessage = `Export pending. Progress: ${data.progress || 'Unknown'}`;
                        setTimeout(() => this.checkExportStatus(taskId), 3000); // Check every 3 seconds
                    } else if (data.message) {
                         this.exportStatusMessage = data.message;
                         this.exportSuccess = false;
                    } else  {
                        this.exportStatusMessage = 'Unexpected response from server.';
                        this.exportSuccess = false;
                    }

                } else { 
                    this.exportStatusMessage = 'Export complete.  Preparing download...';
                    const filename = response.headers.get('Content-Disposition').split('filename=')[1];
                    this.downloadFile(taskId, filename);

                }
            } catch (error) {
                console.error('Error checking export status:', error);
                this.exportStatusMessage = 'Failed to check export status. Please try again later.';
                this.exportSuccess = false;
            }
        },
        async downloadFile(taskId, filename) {
             this.downloading = true;
            this.exportStatusMessage = 'Downloading file...';

            try {
                const response = await fetch(`/get-csv/${taskId}`, {
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                    },
                });

                 if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;  // Set the filename for the download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                this.exportStatusMessage = 'Download complete.';
                this.exportSuccess = true;

            } catch (error) {
                  console.error('Error downloading file:', error);
                this.exportStatusMessage = 'Failed to download file.';
                this.exportSuccess = false;
            }  finally {
                 this.downloading = false;
            }

        },
    }
};
