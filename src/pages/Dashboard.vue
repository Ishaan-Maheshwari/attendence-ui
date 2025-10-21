<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold text-primary mb-2">Overview</h1>
      <p class="text-subtitle-1 text-medium-emphasis">Monitor employee attendance and system status</p>
    </div>

    <!-- Stats Cards Row -->
    <v-row class="mb-8">
      <!-- Total Employees Card -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="2" class="h-100" :loading="loading.monthRecords">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Records This Month</p>
                <h2 class="text-h3 font-weight-bold text-primary">{{ currentMonthRecords }}</h2>
              </div>
              <v-avatar size="56" color="primary" variant="tonal">
                <v-icon size="28">mdi-account-multiple-check</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Checked-in Today Card -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="2" class="h-100" :loading="loading.checkedIn">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Checked-in Today</p>
                <h2 class="text-h3 font-weight-bold text-success">{{ checkedInCount }}</h2>
              </div>
              <v-avatar size="56" color="success" variant="tonal">
                <v-icon size="28">mdi-clock-check</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Exceptions Card -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="2" class="h-100" :loading="loading.exceptions">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p v-if="areAllExceptionsLoaded" class="text-caption text-medium-emphasis mb-1">Total Inconsistencies</p>
                <p v-else class="text-caption text-medium-emphasis mb-1">Inconsistencies this month</p>
                <h2 class="text-h3 font-weight-bold text-warning">{{ exceptionsCount }}</h2>
              </div>
              <v-avatar size="56" color="warning" variant="tonal">
                <v-icon size="28">mdi-alert-circle</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- System Status Card -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="2" class="h-100" :loading="loading.syncInfo">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">System Status</p>
                <h3 class="text-h6 font-weight-bold" :class="syncStatus.color">{{ syncStatus.text }}</h3>
                <p class="text-caption mt-1">{{ lastSyncTime }}</p>
              </div>
              <v-avatar size="56" :color="syncStatus.iconColor" variant="tonal">
                <v-icon size="28">{{ syncStatus.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Row -->
    <v-row>
      <!-- Today's Attendance Table -->
      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center justify-space-between w-100">
              <div>
                <h3 class="text-h5 font-weight-bold">Today's Attendance</h3>
                <p class="text-caption text-medium-emphasis mt-1">Currently checked-in employees</p>
              </div>
              <v-btn 
                icon="mdi-refresh" 
                variant="text" 
                :loading="loading.checkedIn"
                @click="fetchCheckedInEmployees"
              ></v-btn>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-0">
            <v-data-table
              :headers="attendanceHeaders"
              :items="checkedInEmployees"
              :loading="loading.checkedIn"
              item-value="id"
              class="elevation-0"
              :items-per-page="10"
              :search="searchTodayAttendance"
              :custom-filter="employeeFilter"
            >
              <!-- 🔎 Search inside table header -->
              <template v-slot:top>
                <v-toolbar color="white" density="compact">
                  <!-- <v-toolbar-title>Checked-in Employees</v-toolbar-title> -->
                  <!-- <v-spacer></v-spacer> -->

                  <v-text-field
                    v-model="searchTodayAttendance"
                    label="Search by Name or ID"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    class="mx-2"
                    rounded
                    style="max-width: 250px;"
                  />
                </v-toolbar>
              </template>
              <template v-slot:item.emp_id="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" color="primary" class="me-3">
                    <span class="text-caption">{{ getInitials(getEmployeeName(item.emp_id)) }}</span>
                  </v-avatar>
                  <div>
                    <!-- <p class="font-weight-medium mb-0">{{ getEmployeeName(item.emp_id) }}</p> -->
                    <p class="font-weight-medium mb-0">{{ item.employee?.name || 'Employee ' + item.emp_id }}</p>
                    <p class="text-caption text-medium-emphasis">ID: {{ item.emp_id }}</p>
                  </div>
                </div>
              </template>

              <template v-slot:item.check_in="{ item }">
                <div>
                  <p class="font-weight-medium mb-0"> {{ formatTime(item.check_in) }}</p>
                  <p class="text-caption text-medium-emphasis">{{ formatDateFromTimestamp(item.check_in) }}</p>
                </div>
              </template>

              <template v-slot:item.duration="{ item }">
                <v-chip 
                  :color="getDurationColor(item.duration)" 
                  variant="tonal" 
                  size="small"
                >
                  {{ formatDuration(item.duration) }}
                </v-chip>
              </template>

              <template v-slot:no-data>
                <div class="text-center pa-8">
                  <v-icon size="48" color="grey-lighten-1" class="mb-4">mdi-account-clock</v-icon>
                  <p class="text-h6 text-medium-emphasis">No employees checked-in today</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Sidebar -->
      <v-col cols="12" lg="6">
        <!-- Exception Panel -->
        <v-card elevation="2" class="mb-6">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center justify-space-between w-100">
              <div>
                <h3 class="text-h6 font-weight-bold">Exception Panel</h3>
                <p class="text-caption text-medium-emphasis mt-1">Issues requiring attention</p>
              </div>
              <div class="d-flex align-center" style="gap: 12px;">
                <!-- Month Picker -->
                 <v-select v-if="areAllExceptionsLoaded"
                  v-model="monthFilter"
                  :items="monthOptions"
                  label="Filter by Month"
                  variant="outlined"
                  density="compact"
                  placeholder="Select Month"
                  hide-details
                  clearable
                  color="primary"
                  prepend-inner-icon="mdi-check-circle-outline"
                />
                <!-- 📅 Date Picker -->
                <v-text-field v-if="areAllExceptionsLoaded"
                  v-model="selectedDate"
                  label="Filter by Date"
                  type="date"
                  density="compact"
                  variant="outlined"
                  hide-details
                  clearable
                  rounded="lg"
                  style="max-width: 180px;"
                />
                <v-btn 
                  icon="mdi-refresh" 
                  variant="text" 
                  size="regular"
                  :loading="loading.exceptions"
                  @click="fetchExceptions"
                />
                <v-btn 
                  icon="mdi-cloud-refresh" 
                  variant="text" 
                  size="regular"
                  :loading="loading.allExceptions"
                  @click="fetchAllExceptions"
                />
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-list class="py-0" max-height="400" style="overflow-y: auto">
              <template v-for="(exception, index) in filteredExceptions" :key="exception.id">

                <v-list-item class="px-6 py-4">
                  <template v-slot:prepend>
                    <v-avatar size="32" :color="getExceptionColor(exception.status)">
                      <v-icon size="16">{{ getExceptionIcon(exception.status) }}</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ exception.employee?.name || 'Employee ' + exception.emp_id }}
                  </v-list-item-title>
                  
                  <v-list-item-subtitle>
                    <div class="d-flex align-center flex-wrap mt-1" style="gap: 8px;">
                      <v-chip 
                        size="x-small" 
                        :color="getExceptionColor(exception.status)"
                        variant="tonal"
                        class="mb-0"
                      >
                        {{ formatStatus(exception.status) }}
                      </v-chip>
                      <p class="text-caption mb-0" style="white-space: nowrap;">
                        {{ formatDate(exception.start_date) }}
                      </p>
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-list-item-action class="flex-column align-end">
                      <v-btn 
                        class="pa-2"
                        size="small"
                        variant="tonal" 
                        color="indigo-darken-2"
                        rounded="lg"
                        @click="regularise(exception.id)"
                        block
                      >
                      <v-icon size="16" class="mr-2">mdi-hammer-wrench</v-icon>
                      Regularise
                    </v-btn>
                    </v-list-item-action>
                    
                  </template>

                </v-list-item>
                
                <v-divider v-if="index < filteredExceptions.length - 1"></v-divider>
              </template>

              <div v-if="filteredExceptions.length === 0 && !loading.filteredExceptions" class="text-center pa-8">
                <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
                <p class="text-medium-emphasis">No exceptions found</p>
              </div>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Export Report Card -->
        <!-- <v-card elevation="2">
          <v-card-title class="pa-6 pb-4">
            <h3 class="text-h6 font-weight-bold">Export Report</h3>
            <p class="text-caption text-medium-emphasis mt-1">Download attendance records</p>
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <v-form @submit.prevent="exportReport">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="exportForm.from_date"
                    label="From Date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-text-field
                    v-model="exportForm.to_date"
                    label="To Date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    block
                    :loading="loading.export"
                    prepend-icon="mdi-download"
                  >
                    Export Report
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card> -->
         <v-card elevation="2">
        <v-card-title class="pa-6 pb-4">
          <h3 class="text-h6 font-weight-bold">Export Report</h3>
          <p class="text-caption text-medium-emphasis mt-1">
            Download attendance records
          </p>
        </v-card-title>

        <v-card-text class="pa-6 pt-0">
          <v-form @submit.prevent="exportReport">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="month"
                  :items="items"
                  :rules="[v => !!v || 'Month is required']"
                  label="Month"
                  required
                ></v-select
              ></v-col>

              <v-col cols="12"
                ><v-select
                  v-model="year"
                  :items="years"
                  :rules="[v => !!v || 'Year is required']"
                  label="Year"
                  required
                ></v-select
              ></v-col>

              <v-col cols="12">
                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  block
                  :loading="reportLoading"
                  prepend-icon="mdi-download"
                >
                  Export Report
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const currentMonthRecords = ref(0)
const employees = ref([])
const checkedInEmployees = ref([])
const exceptions = ref([])
const syncInfo = ref({})
const searchTodayAttendance = ref("")
const selectedDate = ref(""); // bound to date picker
const monthFilter = ref(""); // bound to month picker
const areAllExceptionsLoaded = ref(false);
const month = ref();
const year = ref();
const reportLoading = ref(false);

const items = [1,2,3,4,5,6,7,8,9,10,11,12];
const years = [2025];

const monthOptions = [
  { title: "Jan", value: "01" },
  { title: "Feb", value: "02" },
  { title: "Mar", value: "03" },
  { title: "Apr", value: "04" },
  { title: "May", value: "05" },
  { title: "Jun", value: "06" },
  { title: "Jul", value: "07" },
  { title: "Aug", value: "08" },
  { title: "Sep", value: "09" },
  { title: "Oct", value: "10" },
  { title: "Nov", value: "11" },
  { title: "Dec", value: "12" },
]

const loading = ref({
  monthRecords: false,
  checkedIn: false,
  exceptions: false,
  syncInfo: false,
  export: false,
  allExceptions: false
})

const exportForm = ref({
  from_date: '',
  to_date: ''
})

// Table headers
const attendanceHeaders = [
  { title: 'Employee', value: 'emp_id', sortable: false },
  { title: 'Check-in Time', value: 'check_in' },
  { title: 'Duration', value: 'duration' }
]

// Computed properties
const checkedInCount = computed(() => checkedInEmployees.value.length)
const exceptionsCount = computed(() => exceptions.value.length)

const syncStatus = computed(() => {
  if (!syncInfo.value.last_sync_time) {
    return {
      text: 'No Data',
      color: 'text-medium-emphasis',
      icon: 'mdi-help-circle',
      iconColor: 'grey'
    }
  }
  
  if (syncInfo.value.error) {
    return {
      text: 'Error',
      color: 'text-error',
      icon: 'mdi-alert-circle',
      iconColor: 'error'
    }
  }
  
  return {
    text: 'Synced',
    color: 'text-success',
    icon: 'mdi-check-circle',
    iconColor: 'success'
  }
})

const lastSyncTime = computed(() => {
  if (!syncInfo.value.last_sync_time) return 'Never'
  return formatDateTime(syncInfo.value.last_sync_time)
})


// search functions
function employeeFilter(value, search, item) {
  if (!search) return true;

  const employeeName = getEmployeeName(item.raw.emp_id)?.toLowerCase() || "";
  const employeeId = String(item.raw.emp_id).toLowerCase();

  return (
    employeeName.includes(search.toLowerCase()) ||
    employeeId.includes(search.toLowerCase())
  );
}

const filteredExceptions = computed(() => {
  let filtered = exceptions.value;
  if (selectedDate.value) {
    // Filter exceptions by selected date
    filtered = exceptions.value.filter(e => {
      // Parse dd-MM-yyyy string properly
      const [day, month, year] = e.start_date.split("-");
      const formattedExDate = `${year}-${month}-${day}`; // yyyy-MM-dd
      return formattedExDate === selectedDate.value;
    });
  }

  if(monthFilter.value) {
    filtered = exceptions.value.filter(e => e.start_date.split('-')[1] === monthFilter.value);
  }

  return filtered;

});


// API functions
const fetchCurrentMonthRecordCount = async () => {
  loading.value.employees = true
  try {
    const response = await fetch('/api/records/count')
    const data = await response.json()
    
    // Handle different response formats
    if (typeof data === 'number') {
      currentMonthRecords.value = data
    } else if (data.count) {
      currentMonthRecords.value = data.count
    } else {
      console.log('Unexpected data format:', data)
      currentMonthRecords.value = 0
    }
  } catch (error) {
    console.error('Error fetching employees:', error)
    currentMonthRecords.value = 0
  } finally {
    loading.value.employees = false
  }
}

const fetchCheckedInEmployees = async () => {
  loading.value.checkedIn = true
  try {
    const response = await fetch('/api/entries/current')
    const data = await response.json()
    
    // Ensure data is array
    if (Array.isArray(data)) {
      checkedInEmployees.value = data
    } else if (data.entries && Array.isArray(data.entries)) {
      checkedInEmployees.value = data.entries
    } else {
      console.log('Unexpected checkedIn data format:', data)
      checkedInEmployees.value = []
    }
  } catch (error) {
    console.error('Error fetching checked-in employees:', error)
    checkedInEmployees.value = []
  } finally {
    loading.value.checkedIn = false
  }
}

const fetchExceptions = async () => {
  loading.value.exceptions = true
  monthFilter.value = ''
  selectedDate.value = null
  try {
    const url = '/api/records/unusuals/current-month'
    const response = await fetch(url)
    const data = await response.json()
    
    // Ensure data is array
    if (Array.isArray(data)) {
      exceptions.value = data
    } else if (data.records && Array.isArray(data.records)) {
      exceptions.value = data.records
    } else {
      console.log('Unexpected exceptions data format:', data)
      exceptions.value = []
    }

    exceptions.value.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
  } catch (error) {
    console.error('Error fetching exceptions:', error)
    exceptions.value = []
  } finally {
    loading.value.exceptions = false
    areAllExceptionsLoaded.value = false
  }
}

const fetchAllExceptions = async () => {
  loading.value.allExceptions = true
  try {
    const url = '/api/records/unusuals'
    const response = await fetch(url)
    const data = await response.json()
    
    // Ensure data is array
    if (Array.isArray(data)) {
      exceptions.value = data
    } else if (data.records && Array.isArray(data.records)) {
      exceptions.value = data.records
    } else {
      console.log('Unexpected exceptions data format:', data)
      exceptions.value = []
    }
  } catch (error) {
    console.error('Error fetching exceptions:', error)
    exceptions.value = []
  } finally {
    loading.value.allExceptions = false
    areAllExceptionsLoaded.value = true
  }
}

const fetchSyncInfo = async () => {
  loading.value.syncInfo = true
  try {
    const response = await fetch('/api/sync_info')
    const data = await response.json()
    syncInfo.value = data
  } catch (error) {
    console.error('Error fetching sync info:', error)
  } finally {
    loading.value.syncInfo = false
  }
}

const exportReport = async () => {
  if (!month.value || !year.value) {
    alert('Please select both month and year')
    return
  }
  
  reportLoading.value = true
  try {
    const params = {
      month: month.value,
      year: year.value
    };
    
    const response = await fetch(`/api/reports/consolidated`,
        {
          method: 'POST', // Set the method to POST
          headers: {
            'Content-Type': 'application/json', // Indicate the body content is JSON
          },
          body: JSON.stringify(params), // Convert the object to a JSON string
        });
    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_report_${month.value}_${year.value}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    reportLoading.value = false
  } catch (error) {
    console.error('Error exporting report:', error)
    alert('Error downloading report')
  } finally {
    loading.value.export = false
  }
}

/*
const exportReport = async () => {
  if (!exportForm.value.from_date || !exportForm.value.to_date) {
    alert('Please select both from and to dates')
    return
  }
  
  loading.value.export = true
  try {
    const params = new URLSearchParams({
      from_date: exportForm.value.from_date,
      to_date: exportForm.value.to_date
    })
    
    const response = await fetch(`/api/records/report?${params}`)
    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_report_${exportForm.value.from_date}_to_${exportForm.value.to_date}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error exporting report:', error)
    alert('Error downloading report')
  } finally {
    loading.value.export = false
  }
}
*/


// Utility functions
const getEmployeeName = (empId) => {
  if (!Array.isArray(employees.value)) {
    return `Employee ${empId}`
  }
  const employee = employees.value.find(emp => emp.id === empId || emp.id === String(empId))
  return employee ? employee.employee.name : `Employee ${empId}`
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
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



const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const [date, time] = dateTimeString.split(' ')
  const [year, month, day] = date.split('-')
  const [hour, minute, second] = time.split(':')
  const dateObj = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateFromTimestamp = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

const formatDuration = (hours) => {
  if (!hours) return 'working in'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

const getDurationColor = (hours) => {
  if (!hours) return 'info'
  if (hours < 4) return 'error'
  if (hours < 8) return 'warning'
  return 'success'
}

const getExceptionColor = (status) => {
  if (!status) return 'grey'
  if (status === 'MISSED_CHECKOUT') return 'error'
  if (status === 'UNUSUAL_CHECKIN') return 'warning'
  return 'info'
}

const getExceptionIcon = (status) => {
  if (!status) return 'mdi-help-circle'
  if (status === 'MISSED_CHECKOUT') return 'mdi-clock-alert'
  if (status === 'SUS_CHECKOUT') return 'mdi-clock-alert'
  return 'mdi-alert-circle'
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const regularise = (recordId) => {
  router.push(`/regularise/${recordId}`)
}

// Initialize component
onMounted(async () => {
  // First fetch employees to populate the lookup
  await fetchCurrentMonthRecordCount()
  
  // Then fetch other data that depends on employee names
  await Promise.all([
    fetchCheckedInEmployees(),
    fetchExceptions(),
    fetchSyncInfo()
  ])
  
  // Set default dates (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  exportForm.value.to_date = today.toISOString().split('T')[0]
  exportForm.value.from_date = thirtyDaysAgo.toISOString().split('T')[0]
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.v-data-table {
  border-radius: 0 !important;
}

.v-list {
  background: transparent;
}
</style>