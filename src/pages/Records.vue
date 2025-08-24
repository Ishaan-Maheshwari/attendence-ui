<template>
  <v-container fluid class="pa-6" style="background-color: #fafafa; min-height: 100vh;">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="text-center">
          <h1 class="text-h3 font-weight-light text-grey-darken-2 mb-2">
            <v-icon large class="mr-3" color="grey-darken-1">mdi-clock-outline</v-icon>
            Time Records Management
          </h1>
          <p class="text-subtitle-1 text-grey">Track and manage employee time records</p>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Left Column: Records Table -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="rounded-lg overflow-hidden">
          <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
            <div class="d-flex align-center w-100">
              <v-icon large color="grey-darken-1" class="mr-3">mdi-table-clock</v-icon>
              <span class="text-h5 font-weight-medium text-grey-darken-2">Time Records</span>
              <v-spacer></v-spacer>
              <v-btn 
                color="grey-darken-2" 
                variant="elevated"
                class="font-weight-medium px-6"
                @click="openNewRecordDialog"
                prepend-icon="mdi-plus"
              >
                Add Record
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-0">
            <!-- Filters Bar -->
            <div class="pa-4 bg-white">
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="search"
                    label="Search records..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    class="rounded-lg"
                    color="grey-darken-2"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="statusFilter"
                    :items="statusOptions"
                    label="Filter by Status"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    color="grey-darken-2"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="dateFilter"
                    label="Filter by Date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    color="grey-darken-2"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn
                    color="grey-lighten-1"
                    variant="outlined"
                    block
                    @click="clearFilters"
                  >
                    Clear
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <v-data-table
              :headers="headers"
              :items="filteredRecords"
              item-key="id"
              @click:row="selectRecord"
              hover
              class="records-table"
              :items-per-page="15"
            >
              <template v-slot:item.emp_id="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="32" class="mr-3" color="grey-lighten-2">
                    <span class="text-grey-darken-2 font-weight-medium text-caption">
                      {{ getEmployeeName(item.emp_id).charAt(0).toUpperCase() }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ getEmployeeName(item.emp_id) }}</div>
                    <div class="text-caption text-grey">ID: {{ item.emp_id }}</div>
                  </div>
                </div>
              </template>
              
              <template v-slot:item.start_date="{ item }">
                <div class="font-weight-medium">
                  {{ formatDate(item.start_date) }}
                </div>
              </template>
              
              <template v-slot:item.start_time="{ item }">
                <v-chip size="small" color="grey-lighten-4" class="text-grey-darken-1">
                  <v-icon start size="small">mdi-clock-start</v-icon>
                  {{ formatTime(item.start_time) }}
                </v-chip>
              </template>
              
              <template v-slot:item.end_time="{ item }">
                <v-chip size="small" color="grey-lighten-3" class="text-grey-darken-2">
                  <v-icon start size="small">mdi-clock-end</v-icon>
                  {{ formatTime(item.end_time) }}
                </v-chip>
              </template>
              
              <template v-slot:item.duration="{ item }">
                <div class="font-weight-medium">
                  {{ formatDuration(item.duration) }}
                </div>
              </template>
              
              <template v-slot:item.status="{ item }">
                <v-chip 
                  size="small" 
                  :color="getStatusColor(item.status)"
                  :class="getStatusTextClass(item.status)"
                >
                  <v-icon start size="small">{{ getStatusIcon(item.status) }}</v-icon>
                  {{ item.status }}
                </v-chip>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <div class="d-flex">
                  <v-btn
                    icon
                    size="small"
                    color="grey-darken-1"
                    variant="text"
                    @click.stop="approveRecord(item.id)"
                    v-if="item.status === 'Pending'"
                  >
                    <v-icon>mdi-check</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Approve Record
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    color="grey-darken-1"
                    variant="text"
                    @click.stop="rejectRecord(item.id)"
                    v-if="item.status === 'Pending'"
                  >
                    <v-icon>mdi-close</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Reject Record
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    color="error"
                    variant="text"
                    @click.stop="deleteRecord(item.id)"
                  >
                    <v-icon>mdi-delete-outline</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Delete Record
                    </v-tooltip>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column: Record Details -->
      <v-col cols="12" md="4">
        <v-card v-if="selectedRecord" elevation="2" class="rounded-lg overflow-hidden">
          <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
            <div class="d-flex align-center w-100">
              <v-icon large color="grey-darken-1" class="mr-3">
                {{ isEditing ? 'mdi-clock-edit-outline' : 'mdi-clock-check-outline' }}
              </v-icon>
              <span class="text-h5 font-weight-medium text-grey-darken-2">
                {{ isEditing ? 'Regularize' : 'Record Details' }}
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
            <!-- Record Status and ID -->
            <div class="text-center mb-6">
              <v-icon size="64" :color="getStatusColor(selectedRecord.status)" class="mb-3">
                {{ getStatusIcon(selectedRecord.status) }}
              </v-icon>
              <h3 class="text-h6 font-weight-medium mb-1">Record #{{ selectedRecord.id }}</h3>
              <v-chip 
                :color="getStatusColor(selectedRecord.status)"
                :class="getStatusTextClass(selectedRecord.status)"
              >
                {{ selectedRecord.status }}
              </v-chip>
            </div>

            <v-form ref="recordForm" class="record-details-form">
              <v-select
                v-model="selectedRecord.emp_id"
                :items="employeeOptions"
                item-title="name"
                item-value="id"
                label="Employee"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-text-field
                v-model="selectedRecord.start_date"
                label="Start Date"
                type="date"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-text-field
                v-model="selectedRecord.start_time"
                label="Start Time"
                type="datetime-local"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-clock-start"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-text-field
                v-model="selectedRecord.end_time"
                label="End Time"
                type="datetime-local"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-clock-end"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-select
                v-model="selectedRecord.shift_id"
                :items="shiftOptions"
                item-title="name"
                item-value="id"
                label="Shift"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-clock-outline"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-text-field
                v-model="selectedRecord.duration"
                label="Duration (hours)"
                type="number"
                step="0.25"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-timer-outline"
                density="comfortable"
                class="mb-3"
                :color="isEditing ? 'grey-darken-2' : 'grey'"
              />
              
              <v-select
                v-model="selectedRecord.status"
                :items="statusOptions"
                label="Status"
                :disabled="!isEditing"
                variant="outlined"
                prepend-inner-icon="mdi-check-circle-outline"
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
              @click="updateRecord"
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
            mdi-clock-outline
          </v-icon>
          <h3 class="text-h6 font-weight-medium text-grey mb-2">No Record Selected</h3>
          <p class="text-body-2 text-grey">Click on a record from the table to view its details</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Record Dialog -->
    <v-dialog v-model="newRecordDialog" max-width="700px" persistent>
      <v-card class="rounded-lg overflow-hidden">
        <v-card-title class="pa-6" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
          <div class="d-flex align-center">
            <v-icon large color="grey-darken-1" class="mr-3">mdi-clock-plus-outline</v-icon>
            <span class="text-h5 font-weight-medium text-grey-darken-2">Add New Record</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newRecordForm" class="new-record-form">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newRecord.emp_id"
                  :items="employeeOptions"
                  item-title="name"
                  item-value="id"
                  label="Employee"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newRecord.start_date" 
                  label="Start Date" 
                  type="date"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newRecord.start_time" 
                  label="Start Time" 
                  type="datetime-local"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-start"
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newRecord.end_time" 
                  label="End Time" 
                  type="datetime-local"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-end"
                  density="comfortable"
                  color="grey-darken-2"
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
                  density="comfortable"
                  color="grey-darken-2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="newRecord.duration" 
                  label="Duration (hours)" 
                  type="number"
                  step="0.25"
                  variant="outlined"
                  prepend-inner-icon="mdi-timer-outline"
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
            @click="createRecord"
            prepend-icon="mdi-check"
          >
            Create Record
          </v-btn>
          <v-btn 
            color="grey-lighten-1" 
            variant="outlined"
            size="large"
            class="flex-grow-1"
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

const headers = [
  { title: "ID", key: "id", width: "60px" },
  { title: "Employee", key: "emp_id", width: "200px" },
  { title: "Date", key: "start_date", width: "120px" },
  { title: "Start", key: "start_time", width: "100px" },
  { title: "End", key: "end_time", width: "100px" },
  { title: "Duration", key: "duration", width: "100px" },
  { title: "Status", key: "status", width: "120px" },
  { title: "Actions", key: "actions", sortable: false, width: "120px" },
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

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.emp_id.toLowerCase().includes(searchLower) ||
      getEmployeeName(record.emp_id).toLowerCase().includes(searchLower)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(record => record.status === statusFilter.value)
  }

  if (dateFilter.value) {
    filtered = filtered.filter(record => record.start_date === dateFilter.value)
  }

  return filtered
})

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
}

// Helper functions
const getEmployeeName = (empId) => {
  const employee = employees.value.find(emp => emp.id === empId)
  return employee ? employee.name : empId
}

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\/|\s/g, '-');
}

const formatTime = (timeStr) => {
  if (!timeStr) return ""
  return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDuration = (duration) => {
  if (!duration) return ""
  const hours = Math.floor(duration)
  const minutes = Math.round((duration - hours) * 60)
  return `${hours}h ${minutes}m`
}

const getStatusColor = (status) => {
  switch (status) {
    case "Approved": return "grey-lighten-4"
    case "Rejected": return "grey-lighten-3"
    default: return "grey-lighten-2"
  }
}

const getStatusTextClass = (status) => {
  switch (status) {
    case "Approved": return "text-grey-darken-1"
    case "Rejected": return "text-grey-darken-2"
    default: return "text-grey-darken-1"
  }
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
.records-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
  cursor: pointer;
}

.record-details-form :deep(.v-field--disabled) {
  opacity: 0.8;
}

.new-record-form :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.new-record-form :deep(.v-field--focused .v-field__outline) {
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