/*export default {
    template: `
    <div class="admin-summary container mt-4">
        <h2 class="mb-4">Admin Summary</h2>
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <div v-else>
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Users</h5>
                            <p class="card-text display-4">{{ totalUsers }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Subjects</h5>
                            <p class="card-text display-4">{{ totalSubjects }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Quizzes</h5>
                            <p class="card-text display-4">{{ totalQuizzes }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-4">
                    <canvas ref="subjectsChart"></canvas>
                </div>
                <div class="col-md-6 mb-4">
                    <canvas ref="questionsChart" :style="{ maxWidth: '300px', maxHeight: '300px' }"></canvas>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            totalUsers: 0,
            totalSubjects: 0,
            totalQuizzes: 0,
            subjectsData: [],
            loading: true,
            error: null,
            charts: []
        };
    },
    mounted() {
        this.fetchSummaryData();
    },
    methods: {
        async fetchSummaryData() {
            try {
                const response = await fetch('/api/admin/summary', {
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('API response:', data);
                
                if (data &&
                    typeof data.total_users === 'number' &&
                    typeof data.total_subjects === 'number' &&
                    typeof data.total_quizzes === 'number') {
                    this.totalUsers = data.total_users;
                    this.totalSubjects = data.total_subjects;
                    this.totalQuizzes = data.total_quizzes;
                    this.subjectsData = Array.isArray(data.subjects_data) ? data.subjects_data : [];
                    this.$nextTick(() => {
                        this.createCharts();
                    });
                } else {
                    throw new Error('Invalid data structure received from API');
                }
            } catch (error) {
                console.error('Error fetching summary data:', error);
                this.error = 'Failed to load summary data. Please try again later.';
            } finally {
                this.loading = false;
            }
        },
        
        createCharts() {
            this.$nextTick(() => {
                this.destroyCharts();
                if (this.subjectsData.length > 0) {
                    const subjectsChart = this.createSubjectsChart();
                    const questionsChart = this.createQuestionsChart();
                    if (subjectsChart) this.charts.push(subjectsChart);
                    if (questionsChart) this.charts.push(questionsChart);
                } else {
                    console.warn('No subject data available to create charts');
                }
            });
        },
        destroyCharts() {
            this.charts.forEach(chart => chart.destroy());
            this.charts = [];
        },
        createSubjectsChart() {
            const ctx = this.$refs.subjectsChart;
            if (!ctx) {
                console.error('Cannot find subjectsChart element');
                return null;
            }
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.subjectsData.map(subject => subject.name),
                    datasets: [
                        {
                            label: 'Chapters',
                            data: this.subjectsData.map(subject => subject.chapters),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)'
                        },
                        {
                            label: 'Quizzes',
                            data: this.subjectsData.map(subject => subject.quizzes),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Count'
                            },
                            ticks: {
                                stepSize: 1, // Ensure each step is an integer
                                callback: function(value) {
                                    return Math.floor(value); // Ensure the displayed value is an integer
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Subjects'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Chapters and Quizzes by Subject'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },
        
        createQuestionsChart() {
            const ctx = this.$refs.questionsChart;
            if (!ctx) {
                console.error('Cannot find questionsChart element');
                return null;
            }
            return new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: this.subjectsData.map(subject => subject.name),
                    datasets: [{
                        label: 'Total Questions',
                        data: this.subjectsData.map(subject => subject.total_questions),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Questions by Subject'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
}
export default {
    template: `
    <div class="admin-summary container mt-4">
        <h2 class="mb-4">Admin Summary</h2>
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <div v-else>
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Users</h5>
                            <p class="card-text display-4">{{ totalUsers }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Subjects</h5>
                            <p class="card-text display-4">{{ totalSubjects }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Quizzes</h5>
                            <p class="card-text display-4">{{ totalQuizzes }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-4">
                    <canvas ref="subjectsChart"></canvas>
                </div>
                <div class="col-md-6 mb-4">
                    <canvas ref="questionsChart" :style="{ maxWidth: '300px', maxHeight: '300px' }"></canvas>
                </div>
            </div>
            <!-- Add Export Button Here -->
            <button class="btn btn-primary" @click="exportData">Export User Performance Data</button>
        </div>
    </div>
    `,
    data() {
        return {
            totalUsers: 0,
            totalSubjects: 0,
            totalQuizzes: 0,
            subjectsData: [],
            loading: true,
            error: null,
            charts: []
        };
    },
    mounted() {
        this.fetchSummaryData();
    },
    methods: {
        async fetchSummaryData() {
            try {
                const response = await fetch('/api/admin/summary', {
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('API response:', data);

                if (data &&
                    typeof data.total_users === 'number' &&
                    typeof data.total_subjects === 'number' &&
                    typeof data.total_quizzes === 'number') {
                    this.totalUsers = data.total_users;
                    this.totalSubjects = data.total_subjects;
                    this.totalQuizzes = data.total_quizzes;
                    this.subjectsData = Array.isArray(data.subjects_data) ? data.subjects_data : [];
                    this.$nextTick(() => {
                        this.createCharts();
                    });
                } else {
                    throw new Error('Invalid data structure received from API');
                }
            } catch (error) {
                console.error('Error fetching summary data:', error);
                this.error = 'Failed to load summary data. Please try again later.';
            } finally {
                this.loading = false;
            }
        },

        createCharts() {
            this.$nextTick(() => {
                this.destroyCharts();
                if (this.subjectsData.length > 0) {
                    const subjectsChart = this.createSubjectsChart();
                    const questionsChart = this.createQuestionsChart();
                    if (subjectsChart) this.charts.push(subjectsChart);
                    if (questionsChart) this.charts.push(questionsChart);
                } else {
                    console.warn('No subject data available to create charts');
                }
            });
        },
        destroyCharts() {
            this.charts.forEach(chart => chart.destroy());
            this.charts = [];
        },
        createSubjectsChart() {
            const ctx = this.$refs.subjectsChart;
            if (!ctx) {
                console.error('Cannot find subjectsChart element');
                return null;
            }
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.subjectsData.map(subject => subject.name),
                    datasets: [
                        {
                            label: 'Chapters',
                            data: this.subjectsData.map(subject => subject.chapters),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)'
                        },
                        {
                            label: 'Quizzes',
                            data: this.subjectsData.map(subject => subject.quizzes),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Count'
                            },
                            ticks: {
                                stepSize: 1, // Ensure each step is an integer
                                callback: function (value) {
                                    return Math.floor(value); // Ensure the displayed value is an integer
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Subjects'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Chapters and Quizzes by Subject'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },

        createQuestionsChart() {
            const ctx = this.$refs.questionsChart;
            if (!ctx) {
                console.error('Cannot find questionsChart element');
                return null;
            }
            return new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: this.subjectsData.map(subject => subject.name),
                    datasets: [{
                        label: 'Total Questions',
                        data: this.subjectsData.map(subject => subject.total_questions),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Questions by Subject'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },
        async exportData() {
            try {
                const response = await fetch('/admin/trigger-export', { // Use the correct endpoint
                    method: 'POST',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const taskId = data.task_id;
                this.checkExportStatus(taskId);
            } catch (error) {
                console.error('Error triggering export:', error);
                this.error = 'Failed to trigger export. Please try again later.';
            }
        },
        async checkExportStatus(taskId) {
            try {
                const response = await fetch(`/admin/export-status/${taskId}`, { // Use the correct endpoint
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'completed') {
                    const filename = data.file;
                    window.location.href = `/admin/download-csv/${filename}`; // Use the correct endpoint
                } else if (data.status === 'pending') {
                    setTimeout(() => this.checkExportStatus(taskId), 3000); // Check every 3 seconds
                } else {
                    this.error = 'Export failed. Please try again.';
                }
            } catch (error) {
                console.error('Error checking export status:', error);
                this.error = 'Failed to check export status. Please try again later.';
            }
        },

    }
}
*/
export default {
    template: `
    <div class="admin-summary container mt-4">
        <h2 class="mb-4">Admin Summary</h2>
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <div v-else>
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Users</h5>
                            <p class="card-text display-4">{{ totalUsers }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Subjects</h5>
                            <p class="card-text display-4">{{ totalSubjects }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Total Quizzes</h5>
                            <p class="card-text display-4">{{ totalQuizzes }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-4">
                    <canvas ref="subjectsChart"></canvas>
                </div>
                <div class="col-md-6 mb-4">
                    <canvas ref="questionsChart" :style="{ maxWidth: '300px', maxHeight: '300px' }"></canvas>
                </div>
            </div>
            <!-- Add Export Button Here -->
            <button class="btn btn-primary" @click="exportData" :disabled="exporting">
                <span v-if="exporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {{ exporting ? 'Exporting...' : 'Export User Performance Data' }}
            </button>
            <div v-if="exportMessage" class="mt-2">
                {{ exportMessage }}
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            totalUsers: 0,
            totalSubjects: 0,
            totalQuizzes: 0,
            subjectsData: [],
            loading: true,
            error: null,
            charts: [],
            exporting: false,
            exportMessage: null,
        };
    },
    mounted() {
        this.fetchSummaryData();
    },
    methods: {
        async fetchSummaryData() {
            try {
                const response = await fetch('/api/admin/summary', {
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('API response:', data);

                if (data &&
                    typeof data.total_users === 'number' &&
                    typeof data.total_subjects === 'number' &&
                    typeof data.total_quizzes === 'number') {
                    this.totalUsers = data.total_users;
                    this.totalSubjects = data.total_subjects;
                    this.totalQuizzes = data.total_quizzes;
                    this.subjectsData = Array.isArray(data.subjects_data) ? data.subjects_data : [];
                    this.$nextTick(() => {
                        this.createCharts();
                    });
                } else {
                    throw new Error('Invalid data structure received from API');
                }
            } catch (error) {
                console.error('Error fetching summary data:', error);
                this.error = 'Failed to load summary data. Please try again later.';
            } finally {
                this.loading = false;
            }
        },

        createCharts() {
            this.$nextTick(() => {
                this.destroyCharts();
                if (this.subjectsData.length > 0) {
                    const subjectsChart = this.createSubjectsChart();
                    const questionsChart = this.createQuestionsChart();
                    if (subjectsChart) this.charts.push(subjectsChart);
                    if (questionsChart) this.charts.push(questionsChart);
                } else {
                    console.warn('No subject data available to create charts');
                }
            });
        },
        destroyCharts() {
            this.charts.forEach(chart => chart.destroy());
            this.charts = [];
        },
        createSubjectsChart() {
            const ctx = this.$refs.subjectsChart;
            if (!ctx) {
                console.error('Cannot find subjectsChart element');
                return null;
            }
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.subjectsData.map(subject => subject.name),
                    datasets: [
                        {
                            label: 'Chapters',
                            data: this.subjectsData.map(subject => subject.chapters),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)'
                        },
                        {
                            label: 'Quizzes',
                            data: this.subjectsData.map(subject => subject.quizzes),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Count'
                            },
                            ticks: {
                                stepSize: 1, // Ensure each step is an integer
                                callback: function (value) {
                                    return Math.floor(value); // Ensure the displayed value is an integer
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Subjects'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Chapters and Quizzes by Subject'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },

        createQuestionsChart() {
            const ctx = this.$refs.questionsChart;
            if (!ctx) {
                console.error('Cannot find questionsChart element');
                return null;
            }
            return new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: this.subjectsData.map(subject => subject.name),
                    datasets: [{
                        label: 'Total Questions',
                        data: this.subjectsData.map(subject => subject.total_questions),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Questions by Subject'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        },
        async exportData() {
            this.exporting = true;
            this.exportMessage = 'Preparing export...';
            try {
                const response = await fetch('/admin/download-csv', { // Use the correct endpoint
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const taskId = data.task_id;
                this.exportMessage = 'Export task started. Checking status...';
                this.checkExportStatus(taskId);
            } catch (error) {
                console.error('Error triggering export:', error);
                this.exportMessage = 'Failed to trigger export. Please try again later.';
                this.error = error.message;
            } finally {
                this.exporting = false;
            }
        },
        async checkExportStatus(taskId) {
            try {
                const response = await fetch(`/admin/get-csv/${taskId}`, { // Use the correct endpoint
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                if (response.headers.get('Content-Type') === 'application/json') {
                    const data = await response.json();
                    if (data.status === 'pending') {
                        this.exportMessage = `Export pending. Progress: ${data.message || 'Unknown'}`;
                        setTimeout(() => this.checkExportStatus(taskId), 3000);
                    } else {
                        this.exportMessage = data.message || 'Export failed. Please try again.';
                        this.error = this.exportMessage;
                    }
                } else {
                    const filename = response.headers.get('Content-Disposition').split('filename=')[1];
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;  // Set the filename for the download
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    this.exportMessage = 'Download complete.';

                }

            } catch (error) {
                console.error('Error checking export status:', error);
                this.exportMessage = 'Failed to check export status. Please try again later.';
                this.error = error.message;
            }
        },

    }
}

