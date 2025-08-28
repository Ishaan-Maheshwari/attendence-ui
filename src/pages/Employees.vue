<template>
  <v-container fluid class="pa-8" style=" min-height: 100vh;">
    <!-- Page Header -->
    <div class="mb-8">
      <!-- <h1 class="text-h3 font-weight-bold text-grey-darken-3 mb-2">Employee Management</h1> -->
      <p class="text-h6 text-grey-darken-1 font-weight-light">Manage your team efficiently and effectively</p>
    </div>

    <v-row class="align-stretch">
      <!-- Left Column: Employee Table -->
      <v-col cols="12" lg="7">
        <v-card 
          elevation="4" 
          class="rounded-xl overflow-hidden h-100"
          style="backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.9);"
        >
          <!-- Card Header -->
          <div class="card-header pa-6">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar size="48" color="primary" class="me-4">
                  <v-icon color="white" size="24">mdi-account-group</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">All Employees</h2>
                  <p class="text-body-2 text-grey-darken-1 mb-0">{{ employees.length }} total employees</p>
                </div>
              </div>
              <v-btn 
                color="primary" 
                variant="flat"
                class="font-weight-medium px-6 py-3"
                @click="openNewEmployeeDialog"
                prepend-icon="mdi-plus"
                rounded="lg"
                size="large"
              >
                Add Employee
              </v-btn>
            </div>
          </div>

          <!-- Search Section -->
          <div class="pa-4 pt-2">
            <v-text-field
              v-model="search"
              label="Search employees..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              class="search-field"
              color="primary"
              rounded
              clearable
            />
          </div>

          <!-- Data Table -->
          <div class="table-container">
            <v-data-table
              :headers="headers"
              :items="employees"
              item-key="id"
              :search="search"
              @click:row="selectEmployee"
              hover
              class="employee-table"
              :items-per-page="10"
              :loading="loading"
            >
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center py-3">
                  <v-avatar size="40" class="me-3 employee-avatar" :color="getAvatarColor(item.name)">
                    <span class="text-white font-weight-bold">
                      {{ getInitials(item.name) }}
                    </span>
                  </v-avatar>
                  <div>
                    <p class="font-weight-bold mb-0 text-grey-darken-3">{{ item.name }}</p>
                    <p class="text-caption text-grey-darken-1 mb-0">ID: {{ item.id }}</p>
                  </div>
                </div>
              </template>
              
              <template v-slot:item.mobile="{ item }">
                <v-chip 
                  size="small" 
                  color="info" 
                  variant="tonal"
                  prepend-icon="mdi-phone"
                  class="font-weight-medium"
                >
                  {{ item.mobile }}
                </v-chip>
              </template>
              
              <template v-slot:item.designation="{ item }">
                <v-chip 
                  size="small" 
                  color="success" 
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ item.designation }}
                </v-chip>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <div class="d-flex">
                  <v-btn
                    icon
                    size="small"
                    color="primary"
                    variant="text"
                    @click.stop="viewAttendanceRecords(item.id)"
                    class="me-1"
                  >
                    <v-icon size="18">mdi-calendar-clock</v-icon>
                    <v-tooltip activator="parent" location="top">
                      View Attendance
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    color="error"
                    variant="text"
                    @click.stop="deleteEmployee(item.id)"
                  >
                    <v-icon size="18">mdi-delete-outline</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Delete Employee
                    </v-tooltip>
                  </v-btn>
                </div>
              </template>

              <template v-slot:no-data>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-account-search</v-icon>
                  <h3 class="text-h6 text-grey mb-2">No employees found</h3>
                  <p class="text-body-2 text-grey">Try adjusting your search criteria</p>
                </div>
              </template>
            </v-data-table>
          </div>
        </v-card>
      </v-col>

      <!-- Right Column: Employee Details -->
      <v-col cols="12" lg="5">
        <v-card 
          v-if="selectedEmployee" 
          elevation="4" 
          class="rounded-xl overflow-hidden h-100"
          style="backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.9);"
        >
          <!-- Details Header -->
          <div class="card-header pa-6">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar size="48" color="secondary" class="me-4">
                  <v-icon color="white" size="24">
                    {{ isEditing ? 'mdi-account-edit' : 'mdi-account-details' }}
                  </v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
                    {{ isEditing ? 'Edit Employee' : 'Employee Details' }}
                  </h2>
                  <p class="text-body-2 text-grey-darken-1 mb-0">Manage employee information</p>
                </div>
              </div>
              <!-- <v-btn
                v-if="!isEditing"
                color="secondary"
                variant="flat"
                class="font-weight-medium px-4"
                @click="isEditing = true"
                prepend-icon="mdi-pencil"
                rounded="lg"
              >
                Edit
              </v-btn> -->
              <v-btn
                color="secondary"
                variant="flat"
                class="font-weight-medium px-4"
                @click="viewAttendanceRecords(selectedEmployee.id)"
                prepend-icon="mdi-calendar-clock"
                rounded="lg"
              >
                View Attendance
              </v-btn>
            </div>
          </div>
          
          <v-card-text class="pa-6">
            <!-- Employee Profile Header -->
            <div class="text-center mb-8">
              <v-avatar size="96" :color="getAvatarColor(selectedEmployee.name)" class="mb-4 employee-profile-avatar">
                <span class="text-h3 font-weight-bold text-white">
                  {{ getInitials(selectedEmployee.name) }}
                </span>
              </v-avatar>
              <h3 class="text-h4 font-weight-bold text-grey-darken-3 mb-1">{{ selectedEmployee.name }}</h3>
              <v-chip color="primary" variant="outlined" size="large" class="font-weight-medium">
                ID: {{ selectedEmployee.id }}
              </v-chip>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-3 mb-6">
              <v-btn
                v-if="!isEditing"
                color="info"
                variant="tonal"
                class="flex-1"
                @click="isEditing = true"
                prepend-icon="mdi-pencil"
                rounded="lg"
              >
                Edit
              </v-btn>
              <!-- <v-btn
                color="info"
                variant="tonal"
                class="flex-1"
                @click="viewAttendanceRecords(selectedEmployee.id)"
                prepend-icon="mdi-calendar-clock"
                rounded="lg"
              >
                View Attendance
              </v-btn> -->
              <!-- <v-btn
                color="success"
                variant="tonal"
                class="flex-1"
                prepend-icon="mdi-phone"
                rounded="lg"
                @click="callEmployee"
              >
                Call
              </v-btn> -->
            </div>

            <!-- Employee Form -->
            <v-form ref="employeeForm" class="employee-details-form">
              <v-text-field
                v-model="selectedEmployee.name"
                label="Full Name"
                :readonly="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                density="comfortable"
                class="mb-4"
                color="primary"
                rounded="lg"
              />
              
              <v-text-field
                v-model="selectedEmployee.mobile"
                label="Mobile Number"
                :readonly="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                density="comfortable"
                class="mb-4"
                color="primary"
                rounded="lg"
              />
              
              <v-textarea
                v-model="selectedEmployee.address"
                label="Address"
                :readonly="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                rows="3"
                density="comfortable"
                class="mb-4"
                color="primary"
                rounded="lg"
              />
              
              <v-text-field
                v-model="selectedEmployee.category"
                label="Category"
                :readonly="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-tag"
                density="comfortable"
                class="mb-4"
                color="primary"
                rounded="lg"
              />
              
              <v-text-field
                v-model="selectedEmployee.designation"
                label="Designation"
                :readonly="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-briefcase"
                density="comfortable"
                class="mb-4"
                color="primary"
                rounded="lg"
              />
            </v-form>
          </v-card-text>
          
          <!-- Edit Actions -->
          <v-card-actions v-if="isEditing" class="pa-6 pt-0">
            <v-btn 
              color="primary" 
              variant="flat"
              size="large"
              class="flex-1 me-3"
              @click="updateEmployee"
              prepend-icon="mdi-check"
              rounded="lg"
              :loading="updating"
            >
              Save Changes
            </v-btn>
            <v-btn 
              color="grey" 
              variant="outlined"
              size="large"
              class="flex-1"
              @click="cancelEdit"
              prepend-icon="mdi-close"
              rounded="lg"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Empty State Card -->
        <v-card 
          v-else 
          elevation="4" 
          class="rounded-xl text-center pa-12 h-100 d-flex flex-column justify-center"
          style="backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.9);"
        >
          <v-icon size="80" color="grey-lighten-2" class="mb-6">mdi-account-search</v-icon>
          <h3 class="text-h5 font-weight-bold text-grey-darken-2 mb-3">No Employee Selected</h3>
          <p class="text-body-1 text-grey-darken-1 mb-0">Click on an employee from the table to view their details and manage their information</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Employee Dialog -->
    <v-dialog v-model="newEmployeeDialog" max-width="800px" persistent>
      <v-card class="rounded-xl overflow-hidden" elevation="8">
        <div class="card-header pa-6">
          <div class="d-flex align-center">
            <v-avatar size="48" color="primary" class="me-4">
              <v-icon color="white" size="24">mdi-account-plus</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">Add New Employee</h2>
              <p class="text-body-2 text-grey-darken-1 mb-0">Create a new employee profile</p>
            </div>
          </div>
        </div>
        
        <v-card-text class="pa-6">
          <v-form ref="newEmployeeForm" class="new-employee-form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.id" 
                  label="Employee ID" 
                  variant="outlined"
                  prepend-inner-icon="mdi-identifier"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.name" 
                  label="Full Name" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.mobile" 
                  label="Mobile Number" 
                  variant="outlined"
                  prepend-inner-icon="mdi-phone"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  :rules="[rules.required, rules.phone]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.designation" 
                  label="Designation" 
                  variant="outlined"
                  prepend-inner-icon="mdi-briefcase"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea 
                  v-model="newEmployee.address" 
                  label="Address" 
                  variant="outlined"
                  prepend-inner-icon="mdi-map-marker"
                  rows="3"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.category" 
                  label="Category" 
                  variant="outlined"
                  prepend-inner-icon="mdi-tag"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.reporting_to_id" 
                  label="Reporting To (ID)" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account-supervisor"
                  density="comfortable"
                  color="primary"
                  rounded="lg"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-btn 
            color="primary" 
            variant="flat"
            size="large"
            class="flex-1 me-3"
            @click="createEmployee"
            prepend-icon="mdi-check"
            rounded="lg"
            :loading="creating"
          >
            Create Employee
          </v-btn>
          <v-btn 
            color="grey" 
            variant="outlined"
            size="large"
            class="flex-1"
            @click="closeDialog"
            prepend-icon="mdi-close"
            rounded="lg"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" rounded="lg">
      <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter()

// Reactive data
const employees = ref([])
const selectedEmployee = ref(null)
const isEditing = ref(false)
const search = ref("")
const loading = ref(false)
const updating = ref(false)
const creating = ref(false)

// Dialog and form data
const newEmployeeDialog = ref(false)
const newEmployee = ref({
  id: "",
  name: "",
  mobile: "",
  address: "",
  category: "",
  designation: "",
  reporting_to_id: "",
})

// Snackbar
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
  icon: "mdi-check"
})

// Table configuration
const headers = [
  { title: "Name", key: "name", width: "300px" },
  { title: "Mobile", key: "mobile", width: "160px" },
  { title: "Designation", key: "designation", width: "160px" },
  { title: "Actions", key: "actions", sortable: false, width: "120px", align: "center" },
]

// Form validation rules
const rules = {
  required: (value) => !!value || "This field is required",
  phone: (value) => {
    const pattern = /^[0-9]{10}$/
    return pattern.test(value) || "Please enter a valid 10-digit phone number"
  }
}

// API functions
const fetchEmployees = async () => {
  loading.value = true
  try {
    const res = await axios.get("/api/employees/")
    employees.value = res.data
  } catch (error) {
    console.error("Error fetching employees:", error)
    showSnackbar("Error fetching employees", "error", "mdi-alert")
  } finally {
    loading.value = false
  }
}

const selectEmployee = async (event, { item }) => {
  try {
    const res = await axios.get(`/api/employees/${item.id}`)
    selectedEmployee.value = { ...res.data }
    isEditing.value = false
  } catch (error) {
    console.error("Error fetching employee details:", error)
    showSnackbar("Error fetching employee details", "error", "mdi-alert")
  }
}

const updateEmployee = async () => {
  updating.value = true
  try {
    await axios.put(`/api/employees/${selectedEmployee.value.id}`, selectedEmployee.value)
    isEditing.value = false
    await fetchEmployees()
    showSnackbar("Employee updated successfully", "success", "mdi-check")
  } catch (error) {
    console.error("Error updating employee:", error)
    showSnackbar("Error updating employee", "error", "mdi-alert")
  } finally {
    updating.value = false
  }
}

const deleteEmployee = async (id) => {
  if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
    try {
      await axios.delete(`/api/employees/${id}`)
      await fetchEmployees()
      if (selectedEmployee.value?.id === id) {
        selectedEmployee.value = null
      }
      showSnackbar("Employee deleted successfully", "success", "mdi-check")
    } catch (error) {
      console.error("Error deleting employee:", error)
      showSnackbar("Error deleting employee", "error", "mdi-alert")
    }
  }
}

const createEmployee = async () => {
  const form = ref(null)
  // if (!(await form.value?.validate())?.valid) return

  creating.value = true
  try {
    await axios.post("/api/employees/new", newEmployee.value)
    newEmployeeDialog.value = false
    await fetchEmployees()
    resetForm()
    showSnackbar("Employee created successfully", "success", "mdi-check")
  } catch (error) {
    console.error("Error creating employee:", error)
    showSnackbar("Error creating employee", "error", "mdi-alert")
  } finally {
    creating.value = false
  }
}

const viewAttendanceRecords = (empId) => {
  router.push({ name: 'EmployeeRecords', params: { employeeId: empId } })
}

const callEmployee = () => {
  if (selectedEmployee.value?.mobile) {
    window.open(`tel:${selectedEmployee.value.mobile}`)
  }
}

// Dialog functions
const openNewEmployeeDialog = () => {
  resetForm()
  newEmployeeDialog.value = true
}

const closeDialog = () => {
  newEmployeeDialog.value = false
  resetForm()
}

const resetForm = () => {
  newEmployee.value = {
    id: "",
    name: "",
    mobile: "",
    address: "",
    category: "",
    designation: "",
    reporting_to_id: "",
  }
}

const cancelEdit = async () => {
  if (selectedEmployee.value) {
    await selectEmployee(null, { item: { id: selectedEmployee.value.id } })
  }
  isEditing.value = false
}

// Utility functions
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getAvatarColor = (name) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'purple', 'indigo']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const showSnackbar = (message, color = "success", icon = "mdi-check") => {
  snackbar.value = {
    show: true,
    message,
    color,
    icon
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 240, 240, 0.9) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.search-field {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}

.employee-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.employee-avatar {
  transition: transform 0.2s ease;
}

.employee-avatar:hover {
  transform: scale(1.1);
}

.employee-profile-avatar {
  border: 4px solid rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;
}

.employee-profile-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.3);
}

.table-container {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
}

:deep(.v-field--readonly) {
  opacity: 0.7;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.25px;
  font-weight: 500;
}

:deep(.v-card) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.gap-3 {
  gap: 12px;
}

/* Custom scrollbar */
:deep(.v-data-table) {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

:deep(.v-data-table)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

:deep(.v-data-table)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.v-data-table)::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

:deep(.v-data-table)::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-primary), 0.5);
}
</style>