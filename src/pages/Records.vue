<template>
  <v-container fluid class="px-6 py-8" style="background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); min-height: 100vh;">
    <!-- Header Section -->
    <!-- <div class="text-center mb-12">
      <div class="d-flex align-center justify-center mb-3">
        <v-icon size="40" color="primary" class="mr-3">mdi-clock-time-four-outline</v-icon>
        <h1 class="text-h3 font-weight-light text-grey-darken-3">Time Records</h1>
      </div>
      <p class="text-body-1 text-grey-darken-1  mx-auto">
        Track, manage and regularize employee time records with ease
      </p>
    </div> -->

    <!-- Filters Section -->
    <v-card class="mb-6 elevation-0" style="border: 1px solid #e0e0e0;">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              label="Search by employee..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              color="primary"
              class="search-field"
            />
          </v-col>
          <!-- <v-col cols="12" md="2">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              color="primary"
              prepend-inner-icon="mdi-check-circle-outline"
            />
          </v-col> -->
          <v-col cols="12" md="2">
            <v-text-field
              v-model="dateFilter"
              label="Date"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              color="primary"
              prepend-inner-icon="mdi-calendar"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="employeeFilter"
              :items="employeeOptions"
              item-title="name"
              item-value="id"
              label="Filter by employee"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              color="primary"
              prepend-inner-icon="mdi-account"
            />
          </v-col>
          <v-col cols="12" md="2">
            <!-- <div class="d-flex gap-2"> -->
              <v-btn
                color="grey-lighten-1"
                variant="outlined"
                @click="clearFilters"
                size="small"
                class="flex-grow-1"
              >
                <v-icon size="16" class="mr-1">mdi-filter-off</v-icon>
                Clear
              </v-btn>
            </v-col>
            <v-col cols="12" md="2">
              <v-btn
                color="primary"
                variant="tonal"
                @click="openNewRecordDialog"
                
              >
                <v-icon size="18">mdi-plus</v-icon>
                Add New Record
              </v-btn>
            <!-- </div> -->
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <!-- Records Table -->
      <v-col cols="12" :md="selectedRecord ? 8 : 12">
        <v-card class="elevation-0" style="border: 1px solid #e0e0e0;">
          <v-card-title class="pa-6 bg-white">
            <div class="d-flex align-center justify-between w-100">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-3">mdi-table-large</v-icon>
                <span class="text-h6 font-weight-medium">Records</span>
                <v-chip size="small" color="grey-lighten-2" class="ml-3">
                  {{ filteredRecords.length }} total
                </v-chip>
              </div>
            </div>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-data-table
            :headers="headers"
            :items="filteredRecords"
            item-key="id"
            @click:row="selectRecord"
            hover
            class="records-table elevation-0"
            :items-per-page="15"
            no-data-text="No records found"
          >
            <template v-slot:item.emp_id="{ item }">
              <div class="d-flex align-center py-3">
                <v-avatar size="36" class="mr-3" :color="getEmployeeColor(item.emp_id)">
                  <span class="text-white font-weight-medium text-sm">
                    {{ getEmployeeName(item.emp_id).charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">{{ getEmployeeName(item.emp_id) }}</div>
                  <div class="text-caption text-grey-darken-1">{{ item.emp_id }}</div>
                </div>
              </div>
            </template>
            
            <template v-slot:item.start_date="{ item }">
              <div class="font-weight-medium text-body-2">
                {{ formatDate(item.start_date) }}
              </div>
            </template>
            
            <template v-slot:item.start_time="{ item }">
              <v-chip size="small" color="green-lighten-4" class="text-green-darken-2 font-weight-medium">
                <v-icon start size="16">mdi-play</v-icon>
                {{ formatTime(item.start_time) }}
              </v-chip>
            </template>
            
            <template v-slot:item.end_time="{ item }">
              <v-chip size="small" color="red-lighten-4" class="text-red-darken-2 font-weight-medium">
                <v-icon start size="16">mdi-stop</v-icon>
                {{ formatTime(item.end_time) }}
              </v-chip>
            </template>
            
            <template v-slot:item.duration="{ item }">
              <div class="font-weight-medium text-body-2">
                {{ formatDuration(item.duration) }}
              </div>
            </template>
            
            <template v-slot:item.status="{ item }">
              <v-chip 
                size="small" 
                :color="getStatusColor(item.status)"
                :class="'font-weight-medium ' + getStatusTextClass(item.status)"
              >
                <v-icon start size="16">{{ getStatusIcon(item.status) }}</v-icon>
                {{ item.status }}
              </v-chip>
            </template>
            
            <template v-slot:item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-check"
                  size="small"
                  color="success"
                  variant="text"
                  @click.stop="approveRecord(item.id)"
                  v-if="item.status === 'OUT'"
                >
                  <v-tooltip activator="parent" location="top">Checked Out</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-close"
                  size="small"
                  color="warning"
                  variant="text"
                  @click.stop="rejectRecord(item.id)"
                  v-if="item.status != 'OUT'"
                >
                  <v-tooltip activator="parent" location="top">Missed Checkout</v-tooltip>
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  @click.stop="deleteRecord(item.id)"
                >
                  <v-icon size="18">mdi-delete-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Record Details Panel -->
      <v-col cols="12" md="4" v-if="selectedRecord">
        <v-card class="elevation-0" style="border: 1px solid #e0e0e0; position: sticky; top: 20px;">
          <v-card-title class="pa-6 bg-white">
            <div class="d-flex align-center justify-between w-100">
              <div class="d-flex align-center">
                <v-icon :color="getStatusColor(selectedRecord.status)" class="mr-3">
                  {{ isEditing ? 'mdi-pencil' : getStatusIcon(selectedRecord.status) }}
                </v-icon>
                <span class="text-h6 font-weight-medium">
                  {{ isEditing ? 'Regularize Record' : 'Record Details' }}
                </span>
              </div>
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                color="grey"
                @click="selectedRecord = null; isEditing = false"
              >
              </v-btn>
            </div>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-6">
            <!-- Record Header -->
            <div class="text-center mb-6">
              <div class="d-flex align-center justify-center mb-3">
                <v-avatar size="48" :color="getEmployeeColor(selectedRecord.emp_id)" class="mr-3">
                  <span class="text-white font-weight-bold">
                    {{ getEmployeeName(selectedRecord.emp_id).charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <div class="text-left">
                  <h3 class="text-h6 font-weight-medium">{{ getEmployeeName(selectedRecord.emp_id) }}</h3>
                  <p class="text-caption text-grey-darken-1 mb-0">Record #{{ selectedRecord.id }}</p>
                </div>
              </div>
              <v-chip 
                :color="getStatusColor(selectedRecord.status)"
                :class="'font-weight-medium ' + getStatusTextClass(selectedRecord.status)"
                size="small"
              >
                <v-icon start size="16">{{ getStatusIcon(selectedRecord.status) }}</v-icon>
                {{ selectedRecord.status }}
              </v-chip>
            </div>

            <!-- Record Form -->
            <v-form ref="recordForm" class="record-form">
              <!-- Employee (Always Disabled) -->
              <v-select
                v-model="selectedRecord.emp_id"
                :items="employeeOptions"
                item-title="name"
                item-value="id"
                label="Employee"
                disabled
                variant="outlined"
                prepend-inner-icon="mdi-account"
                density="compact"
                class="mb-4"
                color="grey"
              />
              
              <!-- Date -->
              <v-text-field
                v-model="selectedRecord.start_date"
                label="Date"
                type="date"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
                density="compact"
                class="mb-4"
                :color="isEditing ? 'primary' : 'grey'"
              />
              
              <!-- Time Fields -->
              <v-row class="mb-4">
                <v-col cols="6">
                  <v-text-field
                    v-model="selectedRecord.start_time"
                    label="Start Time"
                    type="time"
                    :disabled="!isEditing"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock-start"
                    density="compact"
                    :color="isEditing ? 'primary' : 'grey'"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="selectedRecord.end_time"
                    label="End Time"
                    type="time"
                    :disabled="!isEditing"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock-end"
                    density="compact"
                    :color="isEditing ? 'primary' : 'grey'"
                  />
                </v-col>
              </v-row>
              
              <!-- Shift and Duration -->
              <v-row class="mb-4">
                <v-col cols="7">
                  <v-select
                    v-model="selectedRecord.shift_id"
                    :items="shiftOptions"
                    item-title="name"
                    item-value="id"
                    label="Shift"
                    :disabled="!isEditing"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock-outline"
                    density="compact"
                    :color="isEditing ? 'primary' : 'grey'"
                  />
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    v-model="selectedRecord.duration"
                    label="Hours"
                    type="number"
                    step="0.25"
                    :disabled="!isEditing"
                    variant="outlined"
                    prepend-inner-icon="mdi-timer-outline"
                    density="compact"
                    :color="isEditing ? 'primary' : 'grey'"
                  />
                </v-col>
              </v-row>
              
              <!-- Status -->
              <v-select
                v-model="selectedRecord.status"
                :items="statusOptions"
                label="Status"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-check-circle-outline"
                density="compact"
                class="mb-4"
                :color="isEditing ? 'primary' : 'grey'"
              />
            </v-form>
          </v-card-text>
          
          <!-- Action Buttons -->
          <v-card-actions class="pa-6 pt-0">
            <template v-if="isEditing">
              <v-btn 
                color="primary" 
                variant="elevated"
                size="large"
                class="flex-grow-1 mr-2"
                @click="updateRecord"
                prepend-icon="mdi-check"
              >
                Save Changes
              </v-btn>
              <v-btn 
                color="grey-lighten-1" 
                variant="outlined"
                size="large"
                @click="cancelEdit"
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
                @click="isEditing = true"
                prepend-icon="mdi-pencil"
              >
                Regularize Record
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Record Dialog -->
    <v-dialog v-model="newRecordDialog" max-width="600px" persistent>
      <v-card class="elevation-8">
        <v-card-title class="pa-6 bg-primary">
          <div class="d-flex align-center text-white">
            <v-icon color="white" class="mr-3">mdi-plus-circle-outline</v-icon>
            <span class="text-h6 font-weight-medium">Add New Record</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newRecordForm">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newRecord.emp_id"
                  :items="employeeOptions"
                  item-title="name"
                  item-value="id"
                  label="Employee"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  density="compact"
                  color="primary"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newRecord.start_date" 
                  label="Date" 
                  type="date"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                  density="compact"
                  color="primary"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newRecord.shift_id"
                  :items="shiftOptions"
                  item-title="name"
                  item-value="id"
                  label="Shift"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-outline"
                  density="compact"
                  color="primary"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newRecord.start_time" 
                  label="Start Time" 
                  type="time"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-start"
                  density="compact"
                  color="primary"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newRecord.end_time" 
                  label="End Time" 
                  type="time"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-end"
                  density="compact"
                  color="primary"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="newRecord.duration" 
                  label="Duration (hours)" 
                  type="number"
                  step="0.25"
                  variant="outlined"
                  prepend-inner-icon="mdi-timer-outline"
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
            @click="createRecord"
            prepend-icon="mdi-check"
          >
            Create Record
          </v-btn>
          <v-btn 
            color="grey-lighten-1" 
            variant="outlined"
            size="large"
            @click="newRecordDialog = false"
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

const records = ref([])
const employees = ref([])
const shifts = ref([])
const selectedRecord = ref(null)
const isEditing = ref(false)
const search = ref("")
const statusFilter = ref("")
const dateFilter = ref("")
const employeeFilter = ref("")

const headers = [
  { title: "Employee", key: "emp_id", width: "250px", sortable: true },
  { title: "Date", key: "start_date", width: "120px", sortable: true },
  { title: "Start", key: "start_time", width: "100px", sortable: false },
  { title: "End", key: "end_time", width: "100px", sortable: false },
  { title: "Duration", key: "duration", width: "100px", sortable: true },
  { title: "Status", key: "status", width: "120px", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "120px", align: "center" },
]

const statusOptions = ["Pending", "Approved", "Rejected"]

const newRecordDialog = ref(false)
const newRecord = ref({
  emp_id: "",
  start_date: "",
  start_time: "",
  end_time: "",
  shift_id: "",
  duration: "",
})

const employeeOptions = computed(() => 
  employees.value.map(emp => ({ id: emp.id, name: emp.name }))
)

const shiftOptions = computed(() => 
  shifts.value.map(shift => ({ id: shift.id, name: shift.name }))
)

const filteredRecords = computed(() => {
  let filtered = records.value

  // Search filter (employee name or ID)
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(record => {
      const employeeName = getEmployeeName(record.emp_id).toLowerCase()
      const employeeId = record.emp_id.toString().toLowerCase()
      return employeeName.includes(searchLower) || employeeId.includes(searchLower)
    })
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(record => record.status === statusFilter.value)
  }

  // Date filter
  if (dateFilter.value) {
    filtered = filtered.filter(record => record.start_date === dateFilter.value)
  }

  // Employee filter
  if (employeeFilter.value) {
    filtered = filtered.filter(record => record.emp_id === employeeFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
})

// API Functions
const fetchRecords = async () => {
  try {
    const res = await axios.get("/api/records/")
    records.value = res.data
  } catch (error) {
    console.error("Error fetching records:", error)
  }
}

const fetchEmployees = async () => {
  try {
    const res = await axios.get("/api/employees/")
    employees.value = res.data
  } catch (error) {
    console.error("Error fetching employees:", error)
  }
}

const fetchShifts = async () => {
  try {
    const res = await axios.get("/api/shifts/")
    shifts.value = res.data
  } catch (error) {
    console.error("Error fetching shifts:", error)
  }
}

const selectRecord = async (event, { item }) => {
  try {
    const res = await axios.get(`/api/records/${item.id}`)
    selectedRecord.value = res.data
    isEditing.value = false
  } catch (error) {
    console.error("Error fetching record details:", error)
  }
}

const updateRecord = async () => {
  try {
    await axios.put(`/api/records/${selectedRecord.value.id}`, selectedRecord.value)
    isEditing.value = false
    await fetchRecords()
  } catch (error) {
    console.error("Error updating record:", error)
  }
}

const deleteRecord = async (id) => {
  if (confirm("Are you sure you want to delete this record?")) {
    try {
      await axios.delete(`/api/records/${id}`)
      await fetchRecords()
      if (selectedRecord.value?.id === id) {
        selectedRecord.value = null
      }
    } catch (error) {
      console.error("Error deleting record:", error)
    }
  }
}

const approveRecord = async (id) => {
  try {
    await axios.patch(`/api/records/${id}`, { status: "Approved" })
    await fetchRecords()
    if (selectedRecord.value?.id === id) {
      selectedRecord.value.status = "Approved"
    }
  } catch (error) {
    console.error("Error approving record:", error)
  }
}

const rejectRecord = async (id) => {
  try {
    await axios.patch(`/api/records/${id}`, { status: "Rejected" })
    await fetchRecords()
    if (selectedRecord.value?.id === id) {
      selectedRecord.value.status = "Rejected"
    }
  } catch (error) {
    console.error("Error rejecting record:", error)
  }
}

const openNewRecordDialog = () => {
  newRecord.value = {
    emp_id: "",
    start_date: "",
    start_time: "",
    end_time: "",
    shift_id: "",
    duration: "",
  }
  newRecordDialog.value = true
}

const createRecord = async () => {
  try {
    await axios.post("/api/records/new", newRecord.value)
    newRecordDialog.value = false
    await fetchRecords()
  } catch (error) {
    console.error("Error creating record:", error)
  }
}

const cancelEdit = async () => {
  if (selectedRecord.value) {
    await selectRecord(null, { item: selectedRecord.value })
  }
  isEditing.value = false
}

const clearFilters = () => {
  search.value = ""
  statusFilter.value = ""
  dateFilter.value = ""
  employeeFilter.value = ""
}

// Helper functions
const getEmployeeName = (empId) => {
  const employee = employees.value.find(emp => emp.id === empId)
  return employee ? employee.name : empId
}

const getEmployeeColor = (empId) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const hash = empId.toString().split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  // Handle DD-MM-YYYY format
  const [day, month, year] = dateStr.split('-')
  const date = new Date(year, month - 1, day) // month is 0-indexed
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return ""
  // Handle full datetime format "YYYY-MM-DD HH:MM:SS"
  const date = new Date(timeStr)
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}
const formatDuration = (duration) => {
  if (!duration) return ""
  const hours = Math.floor(duration)
  const minutes = Math.round((duration - hours) * 60)
  return `${hours}h ${minutes}m`
}

const getStatusColor = (status) => {
  switch (status) {
    case "Approved": return "success"
    case "Rejected": return "error"
    default: return "warning"
  }
}

const getStatusTextClass = (status) => {
  return ""  // Let Vuetify handle the text color based on the chip color
}

const getStatusIcon = (status) => {
  switch (status) {
    case "Approved": return "mdi-check-circle"
    case "Rejected": return "mdi-close-circle"
    default: return "mdi-clock-outline"
  }
}

onMounted(() => {
  fetchRecords()
  fetchEmployees()
  fetchShifts()
})
</script>

<style scoped>
.records-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.records-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

.search-field :deep(.v-field__outline) {
  border-radius: 12px;
}

.record-form :deep(.v-field--disabled .v-field__overlay) {
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

.max-w-md {
  max-width: 28rem;
}
</style>