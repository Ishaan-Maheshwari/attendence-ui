<template>
  <v-container fluid class="px-6 py-4" style="background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); min-height: 100vh;">
    <!-- Header Section -->
    <div class="mb-8">
      <!-- <div class="d-flex align-center justify-center mb-3">
        <v-icon size="40" color="primary" class="mr-3">mdi-hammer-wrench</v-icon>
        <h1 class="text-h3 font-weight-light text-grey-darken-3">Regularise Record</h1>
      </div> -->
      <p class="text-body-1 text-grey-darken-1 ml-2 max-w-md">
        <v-icon size="18" color="grey" class="mr-3">mdi-hammer-wrench</v-icon>
        Edit and manage attendance record with full context
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="text-body-1 text-grey-darken-1 mt-4">Loading record details...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
      closable
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- Main Content -->
    <div v-if="!loading && record">
      <v-row>
        <!-- Record Details to Regularise (Left Column) -->
        <v-col cols="12" lg="4">
          <v-card class="elevation-0 mb-6" style="border: 1px solid #e0e0e0; position: sticky; top: 20px;">
            <v-card-title class="pa-6 bg-primary">
              <div class="d-flex align-center text-white">
                <v-icon color="white" class="mr-3">mdi-pencil-outline</v-icon>
                <div>
                  <span class="text-h6 font-weight-medium">Record to Regularise</span>
                  <div class="text-caption opacity-80">Record #{{ record.id }}</div>
                </div>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <!-- Employee Info -->
              <div class="text-center mb-6">
                <v-avatar size="48" :color="getEmployeeColor(record.emp_id)" class="mb-3">
                  <span class="text-white font-weight-bold">
                    {{ getEmployeeName(record.emp_id).charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <h3 class="text-h6 font-weight-medium">{{ getEmployeeName(record.emp_id) }}</h3>
                <p class="text-caption text-grey-darken-1">ID: {{ record.emp_id }}</p>
                <v-chip 
                  :color="getStatusColor(record.status)"
                  size="small"
                  class="font-weight-medium"
                >
                  <v-icon start size="16">{{ getStatusIcon(record.status) }}</v-icon>
                  {{ record.status }}
                </v-chip>
              </div>

              <!-- Record Form -->
              <v-form ref="recordForm" @submit.prevent="updateRecord">
                <!-- Date -->
                <v-text-field
                  v-model="record.start_date"
                  label="Date"
                  type="date"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                  density="compact"
                  class="mb-4"
                  color="primary"
                  :rules="[v => !!v || 'Date is required']"
                />
                
                <!-- Time Fields -->
                <v-row class="mb-4">
                  <v-col cols="6">
                    <v-text-field
                      v-model="startTime"
                      label="Start Time"
                      type="time"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-start"
                      density="compact"
                      color="primary"
                      :rules="[v => !!v || 'Start time is required']"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="endTime"
                      label="End Time"
                      type="time"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-end"
                      density="compact"
                      color="primary"
                    />
                  </v-col>
                </v-row>
                
                <!-- Shift and Duration -->
                <v-row class="mb-4">
                  <v-col cols="8">
                    <v-select
                      v-model="record.shift"
                      :items="shiftOptions"
                      item-title="name"
                      item-value="id"
                      label="Shift"
                      variant="outlined"
                      prepend-inner-icon="mdi-clock-outline"
                      density="compact"
                      color="primary"
                      :rules="[v => !!v || 'Shift is required']"
                    />
                  </v-col>
                  <!-- <v-col cols="5">
                    <v-text-field
                      v-model.number="record.duration"
                      label="Hours"
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      variant="outlined"
                      prepend-inner-icon="mdi-timer-outline"
                      density="compact"
                      color="primary"
                    />
                  </v-col> -->
                </v-row>
                
                <!-- Status -->
                <v-select
                  v-model="record.status"
                  :items="statusOptions"
                  label="Status"
                  variant="outlined"
                  prepend-inner-icon="mdi-check-circle-outline"
                  density="compact"
                  class="mb-4"
                  color="primary"
                  :rules="[v => !!v || 'Status is required']"
                />

                <!-- Action Buttons -->
                <div class="d-flex gap-2">
                  <v-btn 
                    color="primary" 
                    variant="elevated"
                    size="large"
                    class="flex-grow-1"
                    type="submit"
                    :loading="updating"
                    prepend-icon="mdi-check"
                  >
                    Save Changes
                  </v-btn>
                  <v-btn 
                    color="grey-lighten-1" 
                    variant="outlined"
                    size="large"
                    @click="resetForm"
                    prepend-icon="mdi-refresh"
                  >
                    Reset
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" lg="8">
          <v-row>
            <!-- Current Entry (Top Right) -->
            <v-col cols="12">
              <v-card class="elevation-0 mb-6" style="border: 1px solid #e0e0e0;">
                <v-card-title class="pa-6 bg-success-lighten-4">
                  <div class="d-flex align-center justify-between w-100">
                    <div class="d-flex align-center text-success-darken-2">
                      <v-icon color="success-darken-2" class="mr-3">mdi-account-clock</v-icon>
                      <span class="text-h6 font-weight-medium">Current Entry Status</span>
                    </div>
                    <v-btn
                      icon="mdi-refresh"
                      size="small"
                      variant="text"
                      color="success-darken-2"
                      @click="fetchCurrentEntry"
                      :loading="loadingEntry"
                    >
                      <v-tooltip activator="parent" location="top">Refresh</v-tooltip>
                    </v-btn>
                  </div>
                </v-card-title>
                
                <v-card-text class="pa-6">
                  <div v-if="currentEntry">
                    <v-row>
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-primary">{{ formatDate(currentEntry.start_date) }}</div>
                          <div class="text-caption text-grey-darken-1">Current Date</div>
                        </div>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-center">
                          <v-chip color="green-lighten-4" class="text-green-darken-2">
                            <v-icon start size="16">mdi-play</v-icon>
                            {{ formatTime(currentEntry.start_time) }}
                          </v-chip>
                          <div class="text-caption text-grey-darken-1 mt-1">Check In</div>
                        </div>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-center">
                          <v-chip 
                            v-if="currentEntry.end_time"
                            color="red-lighten-4" 
                            class="text-red-darken-2"
                          >
                            <v-icon start size="16">mdi-stop</v-icon>
                            {{ formatTime(currentEntry.end_time) }}
                          </v-chip>
                          <v-chip v-else color="warning-lighten-4" class="text-warning-darken-2">
                            <v-icon start size="16">mdi-clock-outline</v-icon>
                            Not Checked Out
                          </v-chip>
                          <div class="text-caption text-grey-darken-1 mt-1">Check Out</div>
                        </div>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-info">
                            {{ formatDuration(currentEntry.duration) }}
                          </div>
                          <div class="text-caption text-grey-darken-1">Duration</div>
                        </div>
                      </v-col>
                    </v-row>
                    
                    <v-divider class="my-4"></v-divider>
                    
                    <div class="d-flex align-center justify-between">
                      <div class="d-flex align-center">
                        <v-chip 
                          :color="getStatusColor(currentEntry.status)"
                          size="small"
                        >
                          <v-icon start size="16">{{ getStatusIcon(currentEntry.status) }}</v-icon>
                          {{ currentEntry.status }}
                        </v-chip>
                        <span class="ml-3 text-body-2 text-grey-darken-1">
                          Shift: {{ currentEntry.shift?.name || 'N/A' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="!loadingEntry" class="text-center py-8">
                    <v-icon size="48" color="grey-lighten-2">mdi-calendar-blank</v-icon>
                    <p class="text-body-2 text-grey-darken-1 mt-2">No current entry found</p>
                  </div>
                  <div v-else class="text-center py-4">
                    <v-progress-circular indeterminate color="success" size="32"></v-progress-circular>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Other Records (Bottom Right) -->
            <v-col cols="12">
              <v-card class="elevation-0" style="border: 1px solid #e0e0e0;">
                <v-card-title class="pa-6 bg-white">
                  <div class="d-flex align-center justify-between w-100">
                    <div class="d-flex align-center">
                      <v-icon color="primary" class="mr-3">mdi-history</v-icon>
                      <span class="text-h6 font-weight-medium">Other Records</span>
                      <v-chip size="small" color="grey-lighten-2" class="ml-3">
                        {{ otherRecords.length }} records
                      </v-chip>
                    </div>
                    <v-btn
                      icon="mdi-refresh"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="fetchOtherRecords"
                      :loading="loadingOtherRecords"
                    >
                      <v-tooltip activator="parent" location="top">Refresh</v-tooltip>
                    </v-btn>
                  </div>
                </v-card-title>
                
                <v-divider></v-divider>
                
                <v-data-table
                  :headers="otherRecordsHeaders"
                  :items="otherRecords"
                  item-key="id"
                  hover
                  class="records-table elevation-0"
                  :items-per-page="10"
                  no-data-text="No other records found"
                  :loading="loadingOtherRecords"
                >
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
                    <v-chip 
                      v-if="item.end_time"
                      size="small" 
                      color="red-lighten-4" 
                      class="text-red-darken-2 font-weight-medium"
                    >
                      <v-icon start size="16">mdi-stop</v-icon>
                      {{ formatTime(item.end_time) }}
                    </v-chip>
                    <v-chip v-else size="small" color="warning-lighten-4" class="text-warning-darken-2">
                      <v-icon start size="16">mdi-minus</v-icon>
                      --:--
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
                      class="font-weight-medium"
                    >
                      <v-icon start size="16">{{ getStatusIcon(item.status) }}</v-icon>
                      {{ item.status }}
                    </v-chip>
                  </template>
                  
                  <template v-slot:item.actions="{ item }">
                    <div class="d-flex gap-1">
                      <v-btn
                        size="small"
                        color="primary"
                        variant="tonal"
                        @click="navigateToRegularise(item.id)"
                        :disabled="item.id === record.id"
                      >
                        <v-icon size="18">mdi-hammer-wrench</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ item.id === record.id ? 'Current Record' : 'Regularise' }}
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        size="small"
                        color="error"
                        variant="text"
                        @click="deleteOtherRecord(item.id)"
                        :disabled="item.id === record.id"
                      >
                        <v-icon size="18">mdi-delete-outline</v-icon>
                        <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                      </v-btn>
                    </div>
                  </template>
                </v-data-table>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="successSnackbar"
      color="success"
      timeout="3000"
      location="top right"
    >
      <v-icon start>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import axios from "axios"
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  recordId: {
    type: [String, Number],
    required: true
  }
})

// Reactive data
const record = ref(null)
const recordShiftID = ref(null)
const currentEntry = ref(null)
const otherRecords = ref([])
const shifts = ref([])

const loading = ref(false)
const loadingEntry = ref(false)
const loadingOtherRecords = ref(false)
const updating = ref(false)
const error = ref(null)

const successSnackbar = ref(false)
const successMessage = ref('')

// Form data for time inputs (separate from full datetime)
const startTime = ref('')
const endTime = ref('')

// Watch for time changes to update the full datetime
watch([() => record.value?.start_date, startTime], ([date, time]) => {
  if (date && time && record.value) {
    record.value.start_time = `${date} ${time}:00`
  }
})

watch([() => record.value?.start_date, endTime], ([date, time]) => {
  if (date && time && record.value) {
    record.value.end_time = `${date} ${time}:00`
  }
})

// Table headers
const otherRecordsHeaders = [
  { title: "Date", key: "start_date", width: "120px", sortable: true },
  { title: "Start", key: "start_time", width: "120px", sortable: false },
  { title: "End", key: "end_time", width: "120px", sortable: false },
  { title: "Duration", key: "duration", width: "100px", sortable: true },
  { title: "Status", key: "status", width: "120px", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "120px", align: "center" },
]

// Options
const statusOptions = ["IN", "OUT", "MISSED_CHECKOUT", "REGULARIZED", "ABSENT"]

const shiftOptions = computed(() => 
  shifts.value.map(shift => ({ id: shift?.id, name: shift?.name }))
)

// API Functions
const fetchRecord = async () => {
  try {
    loading.value = true
    error.value = null
    const res = await axios.get(`/api/records/${props.recordId}`)
    record.value = { ...res.data }
    
    // Extract time parts for form inputs
    if (record.value.start_time) {
      startTime.value = extractTime(record.value.start_time)
    }
    if (record.value.end_time) {
      endTime.value = extractTime(record.value.end_time)
    }
     if (record.value.shift){
      record.value.shift = {
        id: 0,
        name: "Not Assigned"
      }
    }
    
    // Fetch related data
    await Promise.all([
      fetchCurrentEntry(),
      fetchOtherRecords(),
      fetchShifts()
    ])
  } catch (err) {
    error.value = "Failed to fetch record details. Please try again."
    console.error("Error fetching record:", err)
  } finally {
    loading.value = false
  }
}

const fetchCurrentEntry = async () => {
  if (!record.value?.emp_id) return
  
  try {
    loadingEntry.value = true
    const res = await axios.get(`/api/entries/emp/${record.value.emp_id}`)
    if (res.data.length > 0) {
      recordShiftID.value = res.data[0]
    }
  } catch (err) {
    console.error("Error fetching current entry:", err)
    currentEntry.value = null
  } finally {
    loadingEntry.value = false
  }
}

const fetchOtherRecords = async () => {
  if (!record.value?.emp_id) return
  
  try {
    loadingOtherRecords.value = true
    const res = await axios.get(`/api/records/employee/${record.value.emp_id}`)
    // Sort by date descending and limit to recent records
    otherRecords.value = res.data
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .slice(0, 20) // Show only last 20 records
  } catch (err) {
    console.error("Error fetching other records:", err)
    otherRecords.value = []
  } finally {
    loadingOtherRecords.value = false
  }
}

const fetchShifts = async () => {
  try {
    const res = await axios.get("/api/shifts/")
    shifts.value = res.data
  } catch (err) {
    console.error("Error fetching shifts:", err)
  }
}

const calculateDuration = (start, end) => {
  console.log(start, end)
  const [startdate, starttime] = start.split(' ')
  const [startday, startmonth, startyear] = startdate.split('-')
  const startDate = new Date(`${startyear}-${startmonth}-${startday}T${starttime}`)
  const [enddate, endtime] = end.split(' ')
  const [endday, endmonth, endyear] = enddate.split('-')
  const endDate = new Date(`${endyear}-${endmonth}-${endday}T${endtime}`)
  const diff =  startDate.getTime()- endDate.getTime()
  console.log(diff)
  return (Math.floor(diff / 1000 / 60) / 60).toFixed(2)
}

const updateRecord = async () => {
  try {
    updating.value = true
    record.value.status = "REGULARIZED"
    record.value.duration = calculateDuration(record.value.start_time, record.value.end_time)
    if (record.value.shift.id == 0){
      record.value.shift = null
    }
    await axios.put(`/api/records/${record.value.id}`, record.value)
    successMessage.value = 'Record updated successfully!'
    successSnackbar.value = true
    
    // Refresh data
    await fetchRecord()
  } catch (err) {
    error.value = "Failed to update record. Please try again."
    console.error("Error updating record:", err)
  } finally {
    updating.value = false
  }
}

const deleteOtherRecord = async (id) => {
  if (!confirm("Are you sure you want to delete this record?")) return
  
  try {
    await axios.delete(`/api/records/${id}`)
    successMessage.value = 'Record deleted successfully!'
    successSnackbar.value = true
    await fetchOtherRecords()
  } catch (err) {
    error.value = "Failed to delete record. Please try again."
    console.error("Error deleting record:", err)
  }
}

const navigateToRegularise = (recordId) => {
  router.push(`/regularise/${recordId}`)
}

const resetForm = async () => {
  await fetchRecord()
}

// Helper functions
const extractTime = (datetimeStr) => {
  if (!datetimeStr) return ''
  // Handle "YYYY-MM-DD HH:MM:SS" format
  const timePart = datetimeStr.split(' ')[1]
  if (timePart) {
    return timePart.substring(0, 5) // Return HH:MM
  }
  return ''
}

const getEmployeeName = (empId) => {
  return `Employee ${empId}` // In real app, fetch from employees data
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
  // Handle both DD-MM-YYYY and YYYY-MM-DD formats
  let date
  if (dateStr.includes('-')) {
    if (dateStr.split('-')[0].length === 4) {
      // YYYY-MM-DD format
      date = new Date(dateStr)
    } else {
      // DD-MM-YYYY format
      const [day, month, year] = dateStr.split('-')
      date = new Date(year, month - 1, day)
    }
  }
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return "--:--"
  // Handle full datetime format "YYYY-MM-DD HH:MM:SS"
  let timeToFormat = timeStr
  if (timeStr.includes(' ')) {
    timeToFormat = timeStr.split(' ')[1]
  }
  
  const [hours, minutes] = timeToFormat.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes), 0)
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

const formatDuration = (duration) => {
  if (!duration) return "0h 0m"
  const hours = Math.floor(duration)
  const minutes = Math.round((duration - hours) * 60)
  return `${hours}h ${minutes}m`
}

const getStatusColor = (status) => {
  switch (status) {
    case "OUT":
    case "REGULARIZED":
      return "success"
    case "IN":
      return "info"
    case "MISSED_CHECKOUT":
      return "warning"
    case "ABSENT":
      return "error"
    default:
      return "grey"
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case "OUT":
      return "mdi-check-circle"
    case "IN":
      return "mdi-login"
    case "MISSED_CHECKOUT":
      return "mdi-alert-circle"
    case "REGULARIZED":
      return "mdi-hammer-wrench"
    case "ABSENT":
      return "mdi-close-circle"
    default:
      return "mdi-help-circle"
  }
}

// Watch for recordId changes (when navigating between records)
watch(() => props.recordId, async (newRecordId, oldRecordId) => {
  if (newRecordId && newRecordId !== oldRecordId) {
    // Clear existing data to show loading state
    record.value = null
    currentEntry.value = null
    otherRecords.value = []
    error.value = null
    
    // Fetch new data
    await fetchRecord()
  }
}, { immediate: false })


onMounted(() => {
  fetchRecord()
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