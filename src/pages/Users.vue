<template>
  <v-container fluid class="px-6 py-8" style="background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); min-height: 100vh;">
    <!-- Header Section -->
    <!-- <div class="text-center mb-8">
      <div class="d-flex align-center justify-center mb-3">
        <v-icon size="40" color="primary" class="mr-3">mdi-account-supervisor</v-icon>
        <h1 class="text-h3 font-weight-light text-grey-darken-3">User Management</h1>
      </div>
      <p class="text-body-1 text-grey-darken-1 max-w-md mx-auto">
        Manage users, roles and permissions with comprehensive control
      </p>
    </div> -->

    <!-- Navigation Tabs -->
    <v-card class="mb-6 elevation-0" style="border: 1px solid #e0e0e0;">
      <v-tabs v-model="activeTab" color="primary" class="px-4">
        <v-tab value="users" class="font-weight-medium">
          <v-icon start size="20">mdi-account-multiple</v-icon>
          Users
          <v-chip size="x-small" color="grey-lighten-2" class="ml-2">{{ users.length }}</v-chip>
        </v-tab>
        <v-tab value="roles" class="font-weight-medium">
          <v-icon start size="20">mdi-shield-account</v-icon>
          Roles
          <v-chip size="x-small" color="grey-lighten-2" class="ml-2">{{ roles.length }}</v-chip>
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Users Tab -->
      <v-window-item value="users">
        <!-- Filters Section -->
        <v-card class="mb-6 elevation-0" style="border: 1px solid #e0e0e0;">
          <v-card-text class="pa-6">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="userSearch"
                  label="Search users..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  color="primary"
                  class="search-field"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="roleFilter"
                  :items="roleFilterOptions"
                  item-title="title"
                  item-value="value"
                  label="Filter by role"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  color="primary"
                  prepend-inner-icon="mdi-shield-account"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  :items="[{title: 'Active', value: 'active'}, {title: 'Inactive', value: 'inactive'}]"
                  item-title="title"
                  item-value="value"
                  label="Filter by status"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  color="primary"
                  prepend-inner-icon="mdi-account-check"
                />
              </v-col>
              <v-col cols="12" md="2">
                <div class="d-flex gap-2">
                  <v-btn
                    color="grey-lighten-1"
                    variant="outlined"
                    @click="clearUserFilters"
                    size="small"
                    class="flex-grow-1"
                  >
                    <v-icon size="16" class="mr-1">mdi-filter-off</v-icon>
                    Clear
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="openNewUserDialog"
                    size="small"
                  >
                    <v-icon size="16">mdi-plus</v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-row>
          <!-- Users Table -->
          <v-col cols="12" :md="selectedUser ? 8 : 12">
            <v-card class="elevation-0" style="border: 1px solid #e0e0e0;">
              <v-card-title class="pa-6 bg-white">
                <div class="d-flex align-center justify-between w-100">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3">mdi-account-multiple</v-icon>
                    <span class="text-h6 font-weight-medium">Users</span>
                    <v-chip size="small" color="grey-lighten-2" class="ml-3">
                      {{ filteredUsers.length }} total
                    </v-chip>
                  </div>
                </div>
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-data-table
                :headers="userHeaders"
                :items="filteredUsers"
                item-key="id"
                @click:row="selectUser"
                hover
                class="users-table elevation-0"
                :items-per-page="12"
                no-data-text="No users found"
              >
                <template v-slot:item.username="{ item }">
                  <div class="d-flex align-center py-3">
                    <v-avatar size="40" class="mr-3" :color="getUserColor(item.id)">
                      <span class="text-white font-weight-medium">
                        {{ item.username.charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium text-body-2">{{ item.username }}</div>
                      <div class="text-caption text-grey-darken-1">{{ item.fullname }}</div>
                    </div>
                  </div>
                </template>
                
                <template v-slot:item.email="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="grey-darken-1" class="mr-2">mdi-email</v-icon>
                    <span class="text-body-2">{{ item.email }}</span>
                  </div>
                </template>
                
                <template v-slot:item.role_id="{ item }">
                  <v-chip 
                    size="small" 
                    :color="getRoleColor(item.role_id)"
                    class="font-weight-medium"
                  >
                    <v-icon start size="16">mdi-shield-account</v-icon>
                    {{ getRoleName(item.role_id) }}
                  </v-chip>
                </template>
                
                <template v-slot:item.designation="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="grey-darken-1" class="mr-2">mdi-briefcase</v-icon>
                    <span class="text-body-2">{{ item.designation }}</span>
                  </div>
                </template>
                
                <template v-slot:item.created_at="{ item }">
                  <span class="text-body-2 text-grey-darken-1">{{ formatDate(item.created_at) }}</span>
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex gap-1">
                    <v-btn
                      icon="mdi-delete-outline"
                      size="small"
                      color="error"
                      variant="text"
                      @click.stop="deleteUser(item.id)"
                    >
                      <v-tooltip activator="parent" location="top">Delete User</v-tooltip>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <!-- User Details Panel -->
          <v-col cols="12" md="4" v-if="selectedUser">
            <v-card class="elevation-0" style="border: 1px solid #e0e0e0; position: sticky; top: 20px;">
              <v-card-title class="pa-6 bg-white">
                <div class="d-flex align-center justify-between w-100">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3">
                      {{ isEditingUser ? 'mdi-account-edit' : 'mdi-account-details' }}
                    </v-icon>
                    <span class="text-h6 font-weight-medium">
                      {{ isEditingUser ? 'Edit User' : 'User Details' }}
                    </span>
                  </div>
                  <v-btn
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    color="grey"
                    @click="selectedUser = null; isEditingUser = false"
                  >
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text class="pa-6">
                <!-- User Header -->
                <div class="text-center mb-6">
                  <v-avatar size="64" :color="getUserColor(selectedUser.id)" class="mb-3">
                    <span class="text-white text-h4 font-weight-bold">
                      {{ selectedUser.username.charAt(0).toUpperCase() }}
                    </span>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-medium">{{ selectedUser.fullname }}</h3>
                  <p class="text-caption text-grey-darken-1 mb-2">@{{ selectedUser.username }}</p>
                  <v-chip 
                    size="small" 
                    :color="getRoleColor(selectedUser.role_id)"
                    class="font-weight-medium"
                  >
                    <v-icon start size="16">mdi-shield-account</v-icon>
                    {{ getRoleName(selectedUser.role_id) }}
                  </v-chip>
                </div>

                <!-- User Form -->
                <v-form ref="userForm" class="user-form">
                  <v-text-field
                    v-model="selectedUser.username"
                    label="Username"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    density="compact"
                    class="mb-4"
                    :color="isEditingUser ? 'primary' : 'grey'"
                  />
                  
                  <v-text-field
                    v-model="selectedUser.fullname"
                    label="Full Name"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-account-circle"
                    density="compact"
                    class="mb-4"
                    :color="isEditingUser ? 'primary' : 'grey'"
                  />
                  
                  <v-text-field
                    v-model="selectedUser.email"
                    label="Email Address"
                    type="email"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    density="compact"
                    class="mb-4"
                    :color="isEditingUser ? 'primary' : 'grey'"
                  />
                  
                  <v-text-field
                    v-model="selectedUser.designation"
                    label="Designation"
                    :disabled="!isEditingUser"
                    variant="outlined"
                    prepend-inner-icon="mdi-briefcase"
                    density="compact"
                    class="mb-4"
                    :color="isEditingUser ? 'primary' : 'grey'"
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
                    density="compact"
                    class="mb-4"
                    :color="isEditingUser ? 'primary' : 'grey'"
                  />

                  <v-text-field
                    v-if="isEditingUser"
                    v-model="selectedUser.password"
                    label="New Password (optional)"
                    type="password"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    density="compact"
                    class="mb-4"
                    color="primary"
                    hint="Leave blank to keep current password"
                    persistent-hint
                  />
                </v-form>
              </v-card-text>
              
              <!-- Action Buttons -->
              <v-card-actions class="pa-6 pt-0">
                <template v-if="isEditingUser">
                  <v-btn 
                    color="primary" 
                    variant="elevated"
                    size="large"
                    class="flex-grow-1 mr-2"
                    @click="updateUser"
                    prepend-icon="mdi-check"
                  >
                    Save Changes
                  </v-btn>
                  <v-btn 
                    color="grey-lighten-1" 
                    variant="outlined"
                    size="large"
                    @click="cancelUserEdit"
                    prepend-icon="mdi-close"
                  >
                  <v-icon start size="16">mdi-close</v-icon>
                    Cancel
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn 
                    color="primary" 
                    variant="elevated"
                    size="large"
                    class="flex-grow-1"
                    @click="isEditingUser = true"
                    prepend-icon="mdi-pencil"
                  >
                  <v-icon start size="16">mdi-pencil</v-icon>
                    Edit User
                  </v-btn>
                </template>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Roles Tab -->
      <v-window-item value="roles">
        <!-- Role Filters -->
        <v-card class="mb-6 elevation-0" style="border: 1px solid #e0e0e0;">
          <v-card-text class="pa-6">
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="roleSearch"
                  label="Search roles..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  color="primary"
                  class="search-field"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="grey-lighten-1"
                  variant="outlined"
                  @click="clearRoleFilters"
                  size="small"
                >
                  <v-icon size="16" class="mr-1">mdi-filter-off</v-icon>
                  Clear Filters
                </v-btn>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="openNewRoleDialog"
                  size="small"
                  class="w-100"
                >
                  <v-icon size="16" class="mr-1">mdi-plus</v-icon>
                  Add Role
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-row>
          <!-- Roles Table -->
          <v-col cols="12" :md="selectedRole ? 8 : 12">
            <v-card class="elevation-0" style="border: 1px solid #e0e0e0;">
              <v-card-title class="pa-6 bg-white">
                <div class="d-flex align-center justify-between w-100">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3">mdi-shield-account</v-icon>
                    <span class="text-h6 font-weight-medium">Roles</span>
                    <v-chip size="small" color="grey-lighten-2" class="ml-3">
                      {{ filteredRoles.length }} total
                    </v-chip>
                  </div>
                </div>
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-data-table
                :headers="roleHeaders"
                :items="filteredRoles"
                item-key="id"
                @click:row="selectRole"
                hover
                class="roles-table elevation-0"
                :items-per-page="10"
                no-data-text="No roles found"
              >
                <template v-slot:item.role="{ item }">
                  <div class="d-flex align-center py-3">
                    <v-avatar size="40" class="mr-3" :color="getRoleColor(item.id)">
                      <v-icon color="white" size="20">mdi-shield-account</v-icon>
                    </v-avatar>
                    <span class="font-weight-medium text-body-1">{{ item.role }}</span>
                  </div>
                </template>
                
                <template v-slot:item.description="{ item }">
                  <span class="text-body-2 text-grey-darken-1">{{ item.description || 'No description' }}</span>
                </template>
                
                <template v-slot:item.user_count="{ item }">
                  <v-chip size="small" color="info" class="font-weight-medium">
                    <v-icon start size="16">mdi-account-group</v-icon>
                    {{ getUserCount(item.id) }} users
                  </v-chip>
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex gap-1">
                    <v-btn
                      icon="mdi-delete-outline"
                      size="small"
                      color="error"
                      variant="text"
                      @click.stop="deleteRole(item.id)"
                      :disabled="getUserCount(item.id) > 0"
                    >
                      <v-tooltip activator="parent" location="top">
                        {{ getUserCount(item.id) > 0 ? 'Cannot delete role with users' : 'Delete Role' }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <!-- Role Details Panel -->
          <v-col cols="12" md="4" v-if="selectedRole">
            <v-card class="elevation-0" style="border: 1px solid #e0e0e0; position: sticky; top: 20px;">
              <v-card-title class="pa-6 bg-white">
                <div class="d-flex align-center justify-between w-100">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-3">
                      {{ isEditingRole ? 'mdi-shield-edit' : 'mdi-shield-check' }}
                    </v-icon>
                    <span class="text-h6 font-weight-medium">
                      {{ isEditingRole ? 'Edit Role' : 'Role Details' }}
                    </span>
                  </div>
                  <v-btn
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    color="grey"
                    @click="selectedRole = null; isEditingRole = false"
                  >
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text class="pa-6">
                <!-- Role Header -->
                <div class="text-center mb-6">
                  <v-avatar size="64" :color="getRoleColor(selectedRole.id)" class="mb-3">
                    <v-icon color="white" size="32">mdi-shield-account</v-icon>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-medium">{{ selectedRole.role }}</h3>
                  <p class="text-caption text-grey-darken-1 mb-2">Role ID: {{ selectedRole.id }}</p>
                  <v-chip size="small" color="info" class="font-weight-medium">
                    <v-icon start size="16">mdi-account-group</v-icon>
                    {{ getUserCount(selectedRole.id) }} users
                  </v-chip>
                </div>

                <!-- Role Form -->
                <v-form ref="roleForm" class="role-form">
                  <v-text-field
                    v-model="selectedRole.role"
                    label="Role Name"
                    :disabled="!isEditingRole"
                    variant="outlined"
                    prepend-inner-icon="mdi-shield-account"
                    density="compact"
                    class="mb-4"
                    :color="isEditingRole ? 'primary' : 'grey'"
                  />
                  
                  <v-textarea
                    v-model="selectedRole.description"
                    label="Description"
                    :disabled="!isEditingRole"
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    rows="4"
                    density="compact"
                    class="mb-4"
                    :color="isEditingRole ? 'primary' : 'grey'"
                  />
                </v-form>
              </v-card-text>
              
              <!-- Action Buttons -->
              <v-card-actions class="pa-6 pt-0">
                <template v-if="isEditingRole">
                  <v-btn 
                    color="primary" 
                    variant="elevated"
                    size="large"
                    class="flex-grow-1 mr-2"
                    @click="updateRole"
                    prepend-icon="mdi-check"
                  >
                    Save Changes
                  </v-btn>
                  <v-btn 
                    color="grey-lighten-1" 
                    variant="outlined"
                    size="large"
                    @click="cancelRoleEdit"
                    prepend-icon="mdi-close"
                  >
                    Cancel
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn 
                    color="primary" 
                    variant="elevated"
                    size="large"
                    class="flex-grow-1"
                    @click="isEditingRole = true"
                  >
                   <v-icon size="18">mdi-pencil</v-icon>
                    Edit Role
                  </v-btn>
                </template>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <!-- Add User Dialog -->
    <v-dialog v-model="newUserDialog" max-width="600px" persistent>
      <v-card class="elevation-8">
        <v-card-title class="pa-6 bg-primary">
          <div class="d-flex align-center text-white">
            <v-icon color="white" class="mr-3">mdi-account-plus</v-icon>
            <span class="text-h6 font-weight-medium">Add New User</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newUserForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newUser.username" 
                  label="Username" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  density="compact"
                  color="primary"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newUser.fullname" 
                  label="Full Name" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account-circle"
                  density="compact"
                  color="primary"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="newUser.email" 
                  label="Email Address" 
                  type="email"
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  density="compact"
                  color="primary"
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
                  density="compact"
                  color="primary"
                  required
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
                  density="compact"
                  color="primary"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-btn 
            color="primary" 
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
      <v-card class="elevation-8">
        <v-card-title class="pa-6 bg-primary">
          <div class="d-flex align-center text-white">
            <v-icon color="white" class="mr-3">mdi-shield-plus</v-icon>
            <span class="text-h6 font-weight-medium">Add New Role</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newRoleForm">
            <v-text-field 
              v-model="newRole.role" 
              label="Role Name" 
              variant="outlined"
              prepend-inner-icon="mdi-shield-account"
              density="compact"
              color="primary"
              class="mb-4"
              required
            />
            <v-textarea 
              v-model="newRole.description" 
              label="Description" 
              variant="outlined"
              prepend-inner-icon="mdi-text"
              rows="4"
              density="compact"
              color="primary"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-btn 
            color="primary" 
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
const statusFilter = ref("")

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
  { title: "User", key: "username", width: "250px", sortable: true },
  { title: "Email", key: "email", width: "200px", sortable: true },
  { title: "Role", key: "role_id", width: "150px", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "80px", align: "center" },
]

const roleHeaders = [
  { title: "Role", key: "role", width: "200px", sortable: true },
  { title: "Description", key: "description", sortable: true },
  { title: "Users", key: "user_count", width: "120px", sortable: false },
  { title: "Actions", key: "actions", sortable: false, width: "80px", align: "center" },
]

// New user/role objects
const newUser = ref({
  username: "",
  fullname: "",
  email: "",
  password: "",
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

  // Search filter
  if (userSearch.value) {
    const searchLower = userSearch.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(searchLower) ||
      user.fullname?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  }

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role_id === roleFilter.value)
  }

  // Status filter (if you have status field)
  if (statusFilter.value) {
    // Implement status filtering based on your data structure
    // filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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

const selectUser = async (event, { item }) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
    const res = await axios.get(`/api/users/${item.id}`, config)
    selectedUser.value = res.data
    isEditingUser.value = false
  } catch (error) {
    console.error("Error fetching user details:", error)
    selectedUser.value = item
    isEditingUser.value = false
  }
}

const selectRole = async (event, { item }) => {
  try {
    const res = await axios.get(`/api/roles/${item.id}`)
    selectedRole.value = res.data
    isEditingRole.value = false
  } catch (error) {
    console.error("Error fetching role details:", error)
    selectedRole.value = item
    isEditingRole.value = false
  }
}

const updateUser = async () => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
    await axios.put(`/api/users/${selectedUser.value.id}`, selectedUser.value, config)
    isEditingUser.value = false
    await fetchUsers()
  } catch (error) {
    console.error("Error updating user:", error)
  }
}

const updateRole = async () => {
  try {
    await axios.put(`/api/roles/${selectedRole.value.id}`, selectedRole.value)
    isEditingRole.value = false
    await fetchRoles()
  } catch (error) {
    console.error("Error updating role:", error)
  }
}

const deleteUser = async (id) => {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
      await axios.delete(`/api/users/${id}`, config)
      await fetchUsers()
      if (selectedUser.value?.id === id) {
        selectedUser.value = null
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }
}

const deleteRole = async (id) => {
  if (getUserCount(id) > 0) {
    alert("Cannot delete role that has users assigned to it.")
    return
  }
  
  if (confirm("Are you sure you want to delete this role?")) {
    try {
      await axios.delete(`/api/roles/${id}`)
      await fetchRoles()
      if (selectedRole.value?.id === id) {
        selectedRole.value = null
      }
    } catch (error) {
      console.error("Error deleting role:", error)
    }
  }
}

const openNewUserDialog = () => {
  newUser.value = {
    username: "",
    fullname: "",
    email: "",
    password: "",
    role_id: "",
  }
  newUserDialog.value = true
}

const openNewRoleDialog = () => {
  newRole.value = {
    role: "",
    description: "",
  }
  newRoleDialog.value = true
}

const createUser = async () => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
    await axios.post("/api/users/new", newUser.value, config)
    newUserDialog.value = false
    await fetchUsers()
  } catch (error) {
    console.error("Error creating user:", error)
  }
}

const createRole = async () => {
  try {
    await axios.post("/api/roles/new", newRole.value)
    newRoleDialog.value = false
    await fetchRoles()
  } catch (error) {
    console.error("Error creating role:", error)
  }
}

const cancelUserEdit = async () => {
  if (selectedUser.value) {
    await selectUser(null, { item: selectedUser.value })
  }
  isEditingUser.value = false
}

const cancelRoleEdit = async () => {
  if (selectedRole.value) {
    await selectRole(null, { item: selectedRole.value })
  }
  isEditingRole.value = false
}

const clearUserFilters = () => {
  userSearch.value = ""
  roleFilter.value = ""
  statusFilter.value = ""
}

const clearRoleFilters = () => {
  roleSearch.value = ""
}

// Helper functions
const getUserCount = (roleId) => {
  return users.value.filter(user => user.role_id === roleId).length
}

const getRoleName = (roleId) => {
  const role = roles.value.find(role => role.id === roleId)
  return role ? role.role : "Unknown"
}

const getUserColor = (userId) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const hash = userId.toString().split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

const getRoleColor = (roleId) => {
  const colors = ['deep-purple', 'indigo', 'blue', 'teal', 'green', 'orange']
  // const hash = roleId.toString().split('').reduce((a, b) => {
  //   a = ((a << 5) - a) + b.charCodeAt(0)
  //   return a & a
  // }, 0)
  // return colors[Math.abs(hash) % colors.length]
  return colors[Math.floor(Math.random() * colors.length)]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

// Lifecycle hooks
onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<style scoped>
.users-table :deep(.v-data-table__tr),
.roles-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.users-table :deep(.v-data-table__tr:hover),
.roles-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

.search-field :deep(.v-field__outline) {
  border-radius: 12px;
}

.user-form :deep(.v-field--disabled .v-field__overlay),
.role-form :deep(.v-field--disabled .v-field__overlay) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-card) {
  border-radius: 12px !important;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
}

:deep(.v-chip) {
  border-radius: 8px;
}

:deep(.v-tabs .v-btn) {
  text-transform: none;
}

.max-w-md {
  max-width: 28rem;
}

.max-w-sm {
  max-width: 20rem;
}
</style>