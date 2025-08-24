<style scoped>
.users-table :deep(.v-data-table__tr:hover),
.roles-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
  cursor: pointer;
}

.user-details-form :deep(.v-field--disabled),
.role-details-form :deep(.v-field--disabled) {
  opacity: 0.8;
}

.new-user-form :deep(.v-field__outline),
.new-role-form :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.new-user-form :deep(.v-field--focused .v-field__outline),
.new-role-form :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}

:deep(.v-card) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
}

:deep(.v-tabs .v-btn) {
  text-transform: none;
}
</style><template>
  <v-container fluid class="pa-6" style="background-color: #fafafa; min-height: 100vh;">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="text-center">
          <h1 class="text-h3 font-weight-light text-grey-darken-2 mb-2">
            <v-icon large class="mr-3" color="grey-darken-1">mdi-account-supervisor</v-icon>
            User Management System
          </h1>
          <p class="text-subtitle-1 text-grey">Manage users, roles and permissions</p>
        </div>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-tabs v-model="activeTab" color="grey-darken-2" class="mb-4">
          <v-tab value="users">
            <v-icon start>mdi-account-multiple</v-icon>
            Users
          </v-tab>
          <v-tab value="roles">
            <v-icon start>mdi-shield-account</v-icon>
            Roles
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!-- Users Tab -->
    <v-window v-model="activeTab">
      <v-window-item value="users">
        <v-row>
          <!-- Left Column: Users Table -->
          <v-col cols="12" md="7">
            <v-card elevation="2" class="rounded-lg overflow-hidden">
              <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                <div class="d-flex align-center w-100">
                  <v-icon large color="grey-darken-1" class="mr-3">mdi-account-multiple</v-icon>
                  <span class="text-h5 font-weight-medium text-grey-darken-2">Users</span>
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="grey-darken-2" 
                    variant="elevated"
                    class="font-weight-medium px-6"
                    @click="openNewUserDialog"
                    prepend-icon="mdi-plus"
                  >
                    Add User
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-card-text class="pa-0">
                <!-- Search Bar -->
                <div class="pa-4 bg-white">
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-text-field
                        v-model="userSearch"
                        label="Search users..."
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        class="rounded-lg"
                        color="grey-darken-2"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="roleFilter"
                        :items="roleFilterOptions"
                        label="Filter by Role"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        clearable
                        color="grey-darken-2"
                      />
                    </v-col>
                  </v-row>
                </div>

                <v-data-table
                  :headers="userHeaders"
                  :items="filteredUsers"
                  item-key="id"
                  @click:row="selectUser"
                  hover
                  class="users-table"
                  :items-per-page="12"
                >
                  <template v-slot:item.username="{ item }">
                    <div class="d-flex align-center py-2">
                      <v-avatar size="36" class="mr-3" color="grey-lighten-2">
                        <span class="text-grey-darken-2 font-weight-medium">
                          {{ item.username.charAt(0).toUpperCase() }}
                        </span>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium">{{ item.username }}</div>
                        <div class="text-caption text-grey">{{ item.fullname }}</div>
                      </div>
                    </div>
                  </template>
                  
                  <template v-slot:item.email="{ item }">
                    <v-chip size="small" color="grey-lighten-4" class="text-grey-darken-1">
                      <v-icon start size="small">mdi-email</v-icon>
                      {{ item.email }}
                    </v-chip>
                  </template>
                  
                  <template v-slot:item.role_id="{ item }">
                    <v-chip 
                      size="small" 
                      color="grey-lighten-3" 
                      class="text-grey-darken-2"
                    >
                      <v-icon start size="small">mdi-shield-account</v-icon>
                      {{ getRoleName(item.role_id) }}
                    </v-chip>
                  </template>
                  
                  <template v-slot:item.designation="{ item }">
                    <span class="font-weight-medium">{{ item.designation }}</span>
                  </template>
                  
                  <template v-slot:item.created_at="{ item }">
                    <span class="text-body-2">{{ formatDate(item.created_at) }}</span>
                  </template>
                  
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      variant="text"
                      @click.stop="deleteUser(item.id)"
                    >
                      <v-icon>mdi-delete-outline</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Delete User
                      </v-tooltip>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right Column: User Details -->
          <v-col cols="12" md="5">
            <v-card v-if="selectedUser" elevation="2" class="rounded-lg overflow-hidden">
              <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                <div class="d-flex align-center w-100">
                  <v-icon large color="grey-darken-1" class="mr-3">
                    {{ isEditingUser ? 'mdi-account-edit' : 'mdi-account-details' }}
                  </v-icon>
                  <span class="text-h5 font-weight-medium text-grey-darken-2">
                    {{ isEditingUser ? 'Edit User' : 'User Details' }}
                  </span>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="!isEditingUser"
                    color="grey-darken-2"
                    variant="elevated"
                    class="font-weight-medium px-6"
                    @click="isEditingUser = true"
                    prepend-icon="mdi-pencil"
                  >
                    Edit
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-card-text class="pa-6">
                <!-- User Avatar and Basic Info -->
                <div class="text-center mb-6">
                  <v-avatar size="80" color="grey-lighten-2" class="mb-3">
                    <span class="text-h3 font-weight-bold text-grey-darken-2">
                      {{ selectedUser.username.charAt(0).toUpperCase() }}
                    </span>
                  </v-avatar>
                  <h3 class="text-h5 font-weight-medium mb-1">{{ selectedUser.fullname }}</h3>
                  <p class="text-subtitle-1 text-grey">@{{ selectedUser.username }}</p>
                  <v-chip 
                    size="small" 
                    color="grey-lighten-3" 
                    class="text-grey-darken-2"
                  >
                    {{ getRoleName(selectedUser.role_id) }}
                  </v-chip>
                </div>

                <v-form ref="userForm" class="user-details-form">
                  <v-text-field
                    v-model="selectedUser.username"
                    label="Username"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    density="comfortable"
                    class="mb-3"
                    :color="isEditingUser ? 'grey-darken-2' : 'grey'"
                  />
                  
                  <v-text-field
                    v-model="selectedUser.fullname"
                    label="Full Name"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-account-circle"
                    density="comfortable"
                    class="mb-3"
                    :color="isEditingUser ? 'grey-darken-2' : 'grey'"
                  />
                  
                  <v-text-field
                    v-model="selectedUser.email"
                    label="Email Address"
                    type="email"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    density="comfortable"
                    class="mb-3"
                    :color="isEditingUser ? 'grey-darken-2' : 'grey'"
                  />
                  
                  <v-text-field
                    v-model="selectedUser.designation"
                    label="Designation"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-briefcase"
                    density="comfortable"
                    class="mb-3"
                    :color="isEditingUser ? 'grey-darken-2' : 'grey'"
                  />
                  
                  <v-select
                    v-model="selectedUser.role_id"
                    :items="roleOptions"
                    item-title="role"
                    item-value="id"
                    label="Role"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-shield-account"
                    density="comfortable"
                    class="mb-3"
                    :color="isEditingUser ? 'grey-darken-2' : 'grey'"
                  />

                  <v-text-field
                    v-if="isEditingUser"
                    v-model="selectedUser.password"
                    label="New Password (leave blank to keep current)"
                    type="password"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    density="comfortable"
                    class="mb-3"
                    color="grey-darken-2"
                  />
                </v-form>
              </v-card-text>
              
              <v-card-actions v-if="isEditingUser" class="pa-6 pt-0">
                <v-btn 
                  color="grey-darken-2" 
                  variant="elevated"
                  size="large"
                  class="flex-grow-1 mr-3"
                  @click="updateUser"
                  prepend-icon="mdi-check"
                >
                  Save Changes
                </v-btn>
                <v-btn 
                  color="grey-lighten-1" 
                  variant="outlined"
                  size="large"
                  class="flex-grow-1"
                  @click="cancelUserEdit"
                  prepend-icon="mdi-close"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- Empty State Card -->
            <v-card v-else elevation="2" class="rounded-lg text-center pa-8">
              <v-icon size="64" color="grey-lighten-3" class="mb-4">
                mdi-account-search
              </v-icon>
              <h3 class="text-h6 font-weight-medium text-grey mb-2">No User Selected</h3>
              <p class="text-body-2 text-grey">Click on a user from the table to view their details</p>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Roles Tab -->
      <v-window-item value="roles">
        <v-row>
          <!-- Left Column: Roles Table -->
          <v-col cols="12" md="8">
            <v-card elevation="2" class="rounded-lg overflow-hidden">
              <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                <div class="d-flex align-center w-100">
                  <v-icon large color="grey-darken-1" class="mr-3">mdi-shield-account</v-icon>
                  <span class="text-h5 font-weight-medium text-grey-darken-2">Roles</span>
                  <v-spacer></v-spacer>
                  <v-btn 
                    color="grey-darken-2" 
                    variant="elevated"
                    class="font-weight-medium px-6"
                    @click="openNewRoleDialog"
                    prepend-icon="mdi-plus"
                  >
                    Add Role
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-card-text class="pa-0">
                <!-- Search Bar -->
                <div class="pa-4 bg-white">
                  <v-text-field
                    v-model="roleSearch"
                    label="Search roles..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="rounded-lg"
                    color="grey-darken-2"
                  />
                </div>

                <v-data-table
                  :headers="roleHeaders"
                  :items="filteredRoles"
                  item-key="id"
                  @click:row="selectRole"
                  hover
                  class="roles-table"
                  :items-per-page="10"
                >
                  <template v-slot:item.role="{ item }">
                    <div class="d-flex align-center py-2">
                      <v-avatar size="36" class="mr-3" color="grey-lighten-2">
                        <v-icon color="grey-darken-2">mdi-shield-account</v-icon>
                      </v-avatar>
                      <span class="font-weight-medium text-h6">{{ item.role }}</span>
                    </div>
                  </template>
                  
                  <template v-slot:item.description="{ item }">
                    <span class="text-body-2">{{ item.description }}</span>
                  </template>
                  
                  <template v-slot:item.user_count="{ item }">
                    <v-chip size="small" color="grey-lighten-4" class="text-grey-darken-1">
                      <v-icon start size="small">mdi-account-group</v-icon>
                      {{ getUserCount(item.id) }} users
                    </v-chip>
                  </template>
                  
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      variant="text"
                      @click.stop="deleteRole(item.id)"
                    >
                      <v-icon>mdi-delete-outline</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Delete Role
                      </v-tooltip>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right Column: Role Details -->
          <v-col cols="12" md="4">
            <v-card v-if="selectedRole" elevation="2" class="rounded-lg overflow-hidden">
              <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                <div class="d-flex align-center w-100">
                  <v-icon large color="grey-darken-1" class="mr-3">
                    {{ isEditingRole ? 'mdi-shield-edit' : 'mdi-shield-check' }}
                  </v-icon>
                  <span class="text-h5 font-weight-medium text-grey-darken-2">
                    {{ isEditingRole ? 'Edit Role' : 'Role Details' }}
                  </span>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="!isEditingRole"
                    color="grey-darken-2"
                    variant="elevated"
                    class="font-weight-medium px-6"
                    @click="isEditingRole = true"
                    prepend-icon="mdi-pencil"
                  >
                    Edit
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-card-text class="pa-6">
                <!-- Role Icon and Info -->
                <div class="text-center mb-6">
                  <v-icon size="64" color="grey-lighten-2" class="mb-3">
                    mdi-shield-account
                  </v-icon>
                  <h3 class="text-h5 font-weight-medium mb-1">{{ selectedRole.role }}</h3>
                  <p class="text-subtitle-1 text-grey">Role ID: {{ selectedRole.id }}</p>
                  <v-chip size="small" color="grey-lighten-4" class="text-grey-darken-1">
                    {{ getUserCount(selectedRole.id) }} users assigned
                  </v-chip>
                </div>

                <v-form ref="roleForm" class="role-details-form">
                  <v-text-field
                    v-model="selectedRole.role"
                    label="Role Name"
                    :disabled="!isEditingRole"
                    variant="outlined"
                    prepend-inner-icon="mdi-shield-account"
                    density="comfortable"
                    class="mb-3"
                    :color="isEditingRole ? 'grey-darken-2' : 'grey'"
                  />
                  
                  <v-textarea
                    v-model="selectedRole.description"
                    label="Description"
                    :disabled="!isEditingRole"
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    rows="4"
                    density="comfortable"
                    class="mb-3"
                    :color="isEditingRole ? 'grey-darken-2' : 'grey'"
                  />
                </v-form>
              </v-card-text>
              
              <v-card-actions v-if="isEditingRole" class="pa-6 pt-0">
                <v-btn 
                  color="grey-darken-2" 
                  variant="elevated"
                  size="large"
                  class="flex-grow-1 mr-3"
                  @click="updateRole"
                  prepend-icon="mdi-check"
                >
                  Save Changes
                </v-btn>
                <v-btn 
                  color="grey-lighten-1" 
                  variant="outlined"
                  size="large"
                  class="flex-grow-1"
                  @click="cancelRoleEdit"
                  prepend-icon="mdi-close"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- Empty State Card -->
            <v-card v-else elevation="2" class="rounded-lg text-center pa-8">
              <v-icon size="64" color="grey-lighten-3" class="mb-4">
                mdi-shield-search
              </v-icon>
              <h3 class="text-h6 font-weight-medium text-grey mb-2">No Role Selected</h3>
              <p class="text-body-2 text-grey">Click on a role from the table to view its details</p>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <!-- Add User Dialog -->
    <v-dialog v-model="newUserDialog" max-width="700px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <div class="d-flex align-center">
            <v-icon large color="grey-darken-1" class="mr-3">mdi-account-plus</v-icon>
            <span class="text-h5 font-weight-medium text-grey-darken-2">Add New User</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newUserForm" class="new-user-form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newUser.username" 
                  label="Username" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  density="comfortable"
                  color="grey-darken-2"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newUser.fullname" 
                  label="Full Name" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account-circle"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="newUser.email" 
                  label="Email Address" 
                  type="email"
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  density="comfortable"
                  color="grey-darken-2"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newUser.password" 
                  label="Password" 
                  type="password"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock"
                  density="comfortable"
                  color="grey-darken-2"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newUser.designation" 
                  label="Designation" 
                  variant="outlined"
                  prepend-inner-icon="mdi-briefcase"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="newUser.role_id"
                  :items="roleOptions"
                  item-title="role"
                  item-value="id"
                  label="Role"
                  variant="outlined"
                  prepend-inner-icon="mdi-shield-account"
                  density="comfortable"
                  color="grey-darken-2"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-btn 
            color="grey-darken-2" 
            variant="elevated"
            size="large"
            class="flex-grow-1 mr-3"
            @click="createUser"
            prepend-icon="mdi-check"
          >
            Create User
          </v-btn>
          <v-btn 
            color="grey-lighten-1" 
            variant="outlined"
            size="large"
            class="flex-grow-1"
            @click="newUserDialog = false"
            prepend-icon="mdi-close"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Role Dialog -->
    <v-dialog v-model="newRoleDialog" max-width="500px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <div class="d-flex align-center">
            <v-icon large color="grey-darken-1" class="mr-3">mdi-shield-plus</v-icon>
            <span class="text-h5 font-weight-medium text-grey-darken-2">Add New Role</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newRoleForm" class="new-role-form">
            <v-text-field 
              v-model="newRole.role" 
              label="Role Name" 
              variant="outlined"
              prepend-inner-icon="mdi-shield-account"
              density="comfortable"
              color="grey-darken-2"
              class="mb-3"
              required
            />
            <v-textarea 
              v-model="newRole.description" 
              label="Description" 
              variant="outlined"
              prepend-inner-icon="mdi-text"
              rows="4"
              density="comfortable"
              color="grey-darken-2"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-btn 
            color="grey-darken-2" 
            variant="elevated"
            size="large"
            class="flex-grow-1 mr-3"
            @click="createRole"
            prepend-icon="mdi-check"
          >
            Create Role
          </v-btn>
          <v-btn 
            color="grey-lighten-1" 
            variant="outlined"
            size="large"
            class="flex-grow-1"
            @click="newRoleDialog = false"
            prepend-icon="mdi-close"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import axios from "axios"

// Tab management
const activeTab = ref("users")

// Users data
const users = ref([])
const selectedUser = ref(null)
const isEditingUser = ref(false)
const userSearch = ref("")
const roleFilter = ref("")

// Roles data
const roles = ref([])
const selectedRole = ref(null)
const isEditingRole = ref(false)
const roleSearch = ref("")

// Dialog states
const newUserDialog = ref(false)
const newRoleDialog = ref(false)

// Headers
const userHeaders = [
  { title: "Username", key: "username", width: "200px" },
  { title: "Email", key: "email", width: "200px" },
  { title: "Role", key: "role_id", width: "150px" },
  { title: "Designation", key: "designation", width: "150px" },
  { title: "Created", key: "created_at", width: "120px" },
  { title: "Actions", key: "actions", sortable: false, width: "80px" },
]

const roleHeaders = [
  { title: "Role", key: "role", width: "200px" },
  { title: "Description", key: "description" },
  { title: "Users", key: "user_count", width: "120px" },
  { title: "Actions", key: "actions", sortable: false, width: "80px" },
]

// New user/role objects
const newUser = ref({
  username: "",
  fullname: "",
  email: "",
  password: "",
  designation: "",
  role_id: "",
})

const newRole = ref({
  role: "",
  description: "",
})

// Computed properties
const roleOptions = computed(() => 
  roles.value.map(role => ({ id: role.id, role: role.role }))
)

const roleFilterOptions = computed(() => 
  roles.value.map(role => ({ title: role.role, value: role.id }))
)

const filteredUsers = computed(() => {
  let filtered = users.value

  if (userSearch.value) {
    const searchLower = userSearch.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(searchLower) ||
      user.fullname?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role_id === roleFilter.value)
  }

  return filtered
})

const filteredRoles = computed(() => {
  if (!roleSearch.value) return roles.value
  
  const searchLower = roleSearch.value.toLowerCase()
  return roles.value.filter(role => 
    role.role.toLowerCase().includes(searchLower) ||
    role.description?.toLowerCase().includes(searchLower)
  )
})

// API functions
const fetchUsers = async () => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
    const res = await axios.get("/api/users/", config)
    users.value = res.data
  } catch (error) {
    console.error("Error fetching users:", error)
  }
}

const fetchRoles = async () => {
  try {
    const res = await axios.get("/api/roles/")
    roles.value = res.data
  } catch (error) {
    console.error("Error fetching roles:", error)
  }
}

const getUserCount = (roleId) => {
  return users.value.filter(user => user.role_id === roleId).length
}

const getRoleName = (roleId) => {
  const role = roles.value.find(role => role.id === roleId)
  return role ? role.role : ""
}

const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

// Lifecycle hooks
onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>