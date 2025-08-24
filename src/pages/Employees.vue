<template>
  <v-container fluid class="pa-6" style="background-color: #fafafa; min-height: 100vh;">
    <!-- Header -->
    <v-row class="mb-2">
      <v-col cols="12">
        <div class="text-center">
          <p class="text-subtitle-1 text-grey">Manage your team efficiently</p>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Left Column: Employee Table -->
      <v-col cols="12" md="7">
        <v-card elevation="2" class="rounded-lg overflow-hidden">
          <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
            <div class="d-flex align-center w-100">
              <v-icon large color="grey-darken-1" class="mr-3">mdi-account-multiple</v-icon>
              <span class="text-h5 font-weight-medium text-grey-darken-2">All Employees</span>
              <v-spacer></v-spacer>
              <v-btn 
                color="grey-darken-2" 
                variant="elevated"
                class="font-weight-medium px-6"
                @click="openNewEmployeeDialog"
                prepend-icon="mdi-plus"
              >
                Add Employee
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-0">
            <!-- Search Bar -->
            <div class="pa-4 bg-white">
              <v-text-field
                v-model="search"
                label="Search employees..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                class="rounded-lg"
                color="grey-darken-2"
              />
            </div>

            <v-data-table
              :headers="headers"
              :items="employees"
              item-key="id"
              :search="search"
              @click:row="selectEmployee"
              hover
              class="employee-table"
              :items-per-page="10"
            >
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="36" class="mr-3" color="grey-lighten-2">
                    <span class="text-grey-darken-2 font-weight-medium">
                      {{ item.name.charAt(0).toUpperCase() }}
                    </span>
                  </v-avatar>
                  <span class="font-weight-medium">{{ item.name }}</span>
                </div>
              </template>
              
              <template v-slot:item.mobile="{ item }">
                <v-chip size="small" color="grey-lighten-3" class="text-grey-darken-2">
                  <v-icon start>mdi-phone</v-icon>
                  {{ item.mobile }}
                </v-chip>
              </template>
              
              <template v-slot:item.designation="{ item }">
                <v-chip size="small" color="grey-lighten-4" class="text-grey-darken-1">
                  {{ item.designation }}
                </v-chip>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  size="small"
                  color="error"
                  variant="text"
                  @click.stop="deleteEmployee(item.id)"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                  <v-tooltip activator="parent" location="top">
                    Delete Employee
                  </v-tooltip>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column: Employee Details -->
      <v-col cols="12" md="5">
        <v-card v-if="selectedEmployee" elevation="2" class="rounded-lg overflow-hidden">
          <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
            <div class="d-flex align-center w-100">
              <v-icon large color="grey-darken-1" class="mr-3">
                {{ isEditing ? 'mdi-account-edit' : 'mdi-account-details' }}
              </v-icon>
              <span class="text-h5 font-weight-medium text-grey-darken-2">
                {{ isEditing ? 'Edit Employee' : 'Employee Details' }}
              </span>
              <v-spacer></v-spacer>
              <v-btn
                v-if="!isEditing"
                color="grey-darken-2"
                variant="elevated"
                class="font-weight-medium px-6"
                @click="isEditing = true"
                prepend-icon="mdi-pencil"
              >
                Edit
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <!-- Employee Avatar and Basic Info -->
            <div class="text-center mb-6">
              <v-avatar size="80" color="grey-lighten-2" class="mb-3">
                <span class="text-h3 font-weight-bold text-grey-darken-2">
                  {{ selectedEmployee.name.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
              <h3 class="text-h5 font-weight-medium mb-1">{{ selectedEmployee.name }}</h3>
              <p class="text-subtitle-1 text-grey">ID: {{ selectedEmployee.id }}</p>
            </div>

            <v-form ref="employeeForm" class="employee-details-form">
              <v-text-field
                v-model="selectedEmployee.name"
                label="Full Name"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-text-field
                v-model="selectedEmployee.mobile"
                label="Mobile Number"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-textarea
                v-model="selectedEmployee.address"
                label="Address"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                rows="2"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-text-field
                v-model="selectedEmployee.category"
                label="Category"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-tag"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-text-field
                v-model="selectedEmployee.designation"
                label="Designation"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-briefcase"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
            </v-form>
          </v-card-text>
          
          <v-card-actions v-if="isEditing" class="pa-6 pt-0">
            <v-btn 
              color="grey-darken-2" 
              variant="elevated"
              size="large"
              class="flex-grow-1 mr-3"
              @click="updateEmployee"
              prepend-icon="mdi-check"
            >
              Save Changes
            </v-btn>
            <v-btn 
              color="grey-lighten-1" 
              variant="outlined"
              size="large"
              class="flex-grow-1"
              @click="cancelEdit"
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
          <h3 class="text-h6 font-weight-medium text-grey mb-2">No Employee Selected</h3>
          <p class="text-body-2 text-grey">Click on an employee from the table to view their details</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Employee Dialog -->
    <v-dialog v-model="newEmployeeDialog" max-width="700px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <div class="d-flex align-center">
            <v-icon large color="grey-darken-1" class="mr-3">mdi-account-plus</v-icon>
            <span class="text-h5 font-weight-medium text-grey-darken-2">Add New Employee</span>
          </div>
        </v-card-title>
        
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
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.name" 
                  label="Full Name" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.mobile" 
                  label="Mobile Number" 
                  variant="outlined"
                  prepend-inner-icon="mdi-phone"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.designation" 
                  label="Designation" 
                  variant="outlined"
                  prepend-inner-icon="mdi-briefcase"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea 
                  v-model="newEmployee.address" 
                  label="Address" 
                  variant="outlined"
                  prepend-inner-icon="mdi-map-marker"
                  rows="2"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.category" 
                  label="Category" 
                  variant="outlined"
                  prepend-inner-icon="mdi-tag"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newEmployee.reporting_to_id" 
                  label="Reporting To (ID)" 
                  variant="outlined"
                  prepend-inner-icon="mdi-account-supervisor"
                  density="comfortable"
                  color="grey-darken-2"
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
            @click="createEmployee"
            prepend-icon="mdi-check"
          >
            Create Employee
          </v-btn>
          <v-btn 
            color="grey-lighten-1" 
            variant="outlined"
            size="large"
            class="flex-grow-1"
            @click="newEmployeeDialog = false"
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
import { ref, onMounted } from "vue"
import axios from "axios"

const employees = ref([])
const selectedEmployee = ref(null)
const isEditing = ref(false)
const search = ref("")

const headers = [
  { title: "ID", key: "id", width: "80px" },
  { title: "Name", key: "name" },
  { title: "Mobile", key: "mobile", width: "150px" },
  { title: "Designation", key: "designation", width: "150px" },
  { title: "Actions", key: "actions", sortable: false, width: "80px" },
]

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

const fetchEmployees = async () => {
  try {
    const res = await axios.get("/api/employees/")
    employees.value = res.data
  } catch (error) {
    console.error("Error fetching employees:", error)
  }
}

const selectEmployee = async (event, { item }) => {
  try {
    const res = await axios.get(`/api/employees/${item.id}`)
    selectedEmployee.value = res.data
    isEditing.value = false
  } catch (error) {
    console.error("Error fetching employee details:", error)
  }
}

const updateEmployee = async () => {
  try {
    await axios.put(`/api/employees/${selectedEmployee.value.id}`, selectedEmployee.value)
    isEditing.value = false
    await fetchEmployees()
  } catch (error) {
    console.error("Error updating employee:", error)
  }
}

const deleteEmployee = async (id) => {
  if (confirm("Are you sure you want to delete this employee?")) {
    try {
      await axios.delete(`/api/employee/${id}`)
      await fetchEmployees()
      if (selectedEmployee.value?.id === id) {
        selectedEmployee.value = null
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
    }
  }
}

const openNewEmployeeDialog = () => {
  newEmployee.value = {
    id: "",
    name: "",
    mobile: "",
    address: "",
    category: "",
    designation: "",
    reporting_to_id: "",
  }
  newEmployeeDialog.value = true
}

const createEmployee = async () => {
  try {
    await axios.post("/api/employees/new", newEmployee.value)
    newEmployeeDialog.value = false
    await fetchEmployees()
  } catch (error) {
    console.error("Error creating employee:", error)
  }
}

const cancelEdit = async () => {
  if (selectedEmployee.value) {
    await selectEmployee(null, { item: selectedEmployee.value })
  }
  isEditing.value = false
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.employee-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
  cursor: pointer;
}

.employee-details-form :deep(.v-field--disabled) {
  opacity: 0.8;
}

.new-employee-form :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.new-employee-form :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}

:deep(.v-card) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
}
</style>