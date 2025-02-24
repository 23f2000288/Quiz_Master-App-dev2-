
export default {
    template: `
        <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">User Management</h2>
            
            <!-- Search Box -->
            <div style="margin-bottom: 20px;">
                <input 
                    v-model="searchQuery" 
                    @input="searchUsers"
                    style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px;"
                    placeholder="Search users by name or email..."
                />
            </div>

            <table style="width: 100%; border-collapse: collapse; background-color: #fff; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
                <thead>
                    <tr>
                        <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; color: #333; text-transform: uppercase;">ID</th>
                        <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; color: #333; text-transform: uppercase;">Email</th>
                        <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; color: #333; text-transform: uppercase;">Full Name</th>
                        <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; color: #333; text-transform: uppercase;">Qualification</th>
                        <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; color: #333; text-transform: uppercase;">Date of Birth</th>
                        <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; color: #333; text-transform: uppercase;">Status</th>
                        <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5; font-weight: bold; color: #333; text-transform: uppercase;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in filteredUsers" :key="user.id" style="border-bottom: 1px solid #e0e0e0;">
                        <td style="padding: 12px 15px;">{{ user.id }}</td>
                        <td style="padding: 12px 15px;">{{ user.email }}</td>
                        <td style="padding: 12px 15px;">{{ user.fullname }}</td>
                        <td style="padding: 12px 15px;">{{ user.qualification }}</td>
                        <td style="padding: 12px 15px;">{{ formatDate(user.dob) }}</td>
                        <td :style="{ padding: '12px 15px', fontWeight: 'bold', color: user.active ? '#4CAF50' : '#F44336' }">
                            {{ user.active ? 'Active' : 'Inactive' }}
                        </td>
                        <td style="padding: 12px 15px;">
                            <button @click="toggleUserStatus(user)" 
                                    :style="{ padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: user.active ? '#F44336' : '#4CAF50', color: 'white' }">
                                {{ user.active ? 'Deactivate' : 'Activate' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    data() {
        return {
            users: [],
            searchQuery: ''
        }
    },
    computed: {
        filteredUsers() {
            if (!this.searchQuery) return this.users;
            const query = this.searchQuery.toLowerCase();
            return this.users.filter(user => 
                user.fullname.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }
    },
    mounted() {
        this.fetchUsers()
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await fetch('/api/users')
                this.users = await response.json()
                console.log(this.users) 
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        },
        async toggleUserStatus(user) {
            try {
                const response = await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ active: !user.active })
                })
                if (response.ok) {
                    user.active = !user.active
                    alert(`User ${user.email} ${user.active ? 'activated' : 'deactivated'} successfully`)
                } else {
                    alert('Failed to update user status')
                }
            } catch (error) {
                console.error('Error updating user status:', error)
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            return new Date(dateString).toLocaleDateString(undefined, options)
        },
        searchUsers() {
            
        }
    }
}

