<template>
  <v-container fluid class="px-6 py-8" style="background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); min-height: 100vh;">
    
    <!-- Employee Summary Section -->
    <v-card class="mb-6 elevation-0" style="border: 1px solid #e0e0e0;">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" md="4">
            <div class="d-flex align-center">
              <v-avatar size="64" :color="getEmployeeColor(employee.id)" class="mr-4">
                <span class="text-white font-weight-bold text-h5">
                  {{ employee.name?.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
              <div>
                <h2 class="text-h5 font-weight-medium mb-1">{{ employee.name }}</h2>
                <p class="text-body-2 text-grey-darken-1 mb-0">Employee ID: {{ employee.id }}</p>
                <p class="text-caption text-grey-darken-1">{{ employee.department || 'Department' }}</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="8">
            <v-row>
              
              <v-col cols="6" md="3">
                <v-card class="text-center py-3"  variant="text">
                  <div class="text-h5 font-weight-bold text-error">{{ monthlyStats.currentMonth }}</div>
                  <div class="text-caption text-error-darken-1">Current Month Stats</div>
                </v-card>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col cols="6" md="3">
                <v-card class="text-center pa-3" color="success-lighten-5" variant="tonal">
                  <div class="text-h6 font-weight-bold text-success">{{ monthlyStats.presentDays }}</div>
                  <div class="text-caption text-success-darken-1">Present Days</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card class="text-center pa-3" color="info-lighten-5" variant="tonal">
                  <div class="text-h6 font-weight-bold text-info">{{ monthlyStats.totalHours }}</div>
                  <div class="text-caption text-info-darken-1">Total Hours</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card class="text-center pa-3" color="warning-lighten-5" variant="tonal">
                  <div class="text-h6 font-weight-bold text-warning">{{ monthlyStats.missedCheckouts }}</div>
                  <div class="text-caption text-warning-darken-1">Missed Checkouts</div>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Filters Section -->
    <v-card class="mb-6 elevation-0" style="border: 1px solid #e0e0e0;">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dateFilter"
              label="Filter by date"
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
              v-model="statusFilter"
              :items="statusOptions"
              label="Filter by status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              color="primary"
              prepend-inner-icon="mdi-check-circle-outline"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="monthFilter"
              :items="monthOptions"
              label="Month"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              color="primary"
              prepend-inner-icon="mdi-calendar-month"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="grey-lighten-1"
              variant="outlined"
              @click="clearFilters"
              size="small"
              class="flex-grow-1"
            >
              <v-icon size="16" class="mr-1">mdi-filter-off</v-icon>
              Clear Filters
            </v-btn>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="tonal"
              @click="openNewRecordDialog"
            >
              <v-icon size="18">mdi-plus</v-icon>
              Add Record
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <!-- Records Table -->
      <v-col cols="12" :md="selectedRecord ? 8 : 12">
        <v-card class="elevation-0" style="border: 1px solid #e0e0e0;">
          <v-card-title class="pa-6 bg-white align-center">
            <div class="d-flex align-center justify-between w-100 ga-4">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-3">mdi-table-large</v-icon>
                <span class="text-h6 font-weight-medium">Attendance Records</span>
                <v-chip size="small" color="grey-lighten-2" class="ml-3">
                  {{ filteredRecords.length }} records
                </v-chip>
              </div>
              <div class="d-flex ga-2">
                <v-btn
                  :color="viewMode === 'table' ? 'primary' : 'grey'"
                  :variant="viewMode === 'table' ? 'tonal' : 'text'"
                  size="small"
                  @click="viewMode = 'table'"
                >
                  <v-tooltip activator="parent" location="top">Table View</v-tooltip>
                  <v-icon size="24">mdi-table</v-icon>
                </v-btn>
                <v-btn
                  :color="viewMode === 'calendar' ? 'primary' : 'grey'"
                  :variant="viewMode === 'calendar' ? 'tonal' : 'text'"
                  size="small"
                  @click="viewMode = 'calendar'"
                >
                  <v-tooltip activator="parent" location="top">Calendar View</v-tooltip>
                  <v-icon size="24">mdi-calendar</v-icon>
                </v-btn>
                <div class="mx-2"></div>
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="exportRecords"
                  prepend-icon="mdi-download"
                >
                  Download Records
                </v-btn>
                
              </div>
            </div>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <!-- Table View -->
          <v-data-table
            v-if="viewMode === 'table'"
            :headers="headers"
            :items="filteredRecords"
            item-key="id"
            @click:row="selectRecord"
            hover
            class="records-table elevation-0"
            :items-per-page="15"
            no-data-text="No records found"
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
                  color="primary"
                  variant="tonal"
                  @click.stop="regularizeRecord(item.id)"
                >
                  <v-icon size="18">mdi-hammer-wrench</v-icon>
                  <v-tooltip activator="parent" location="top">Regularize</v-tooltip>
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

          <!-- Calendar View -->
          <!-- <div v-else class="pa-6">
            <v-row>
              <v-col v-for="day in calendarDays" :key="day.date" cols="12" sm="6" md="3" lg="2">
                <v-card 
                  :color="getCalendarDayColor(day.record)"
                  :variant="day.record ? 'tonal' : 'outlined'"
                  class="pa-3 calendar-day"
                  @click="day.record && selectRecord(null, { item: day.record })"
                >
                  <div class="text-caption text-grey-darken-1">{{ formatCalendarDate(day.date) }}</div>
                  <div v-if="day.record" class="mt-2">
                    <div class="text-body-2 font-weight-medium">
                      {{ formatTime(day.record.start_time) }} - {{ formatTime(day.record.end_time) }}
                    </div>
                    <div class="text-caption">
                      {{ formatDuration(day.record.duration) }}
                    </div>
                    <v-chip size="x-small" :color="getStatusColor(day.record.status)" class="mt-1">
                      {{ day.record.status }}
                    </v-chip>
                  </div>
                  <div v-else class="text-center text-grey-lighten-1 mt-2">
                    <v-icon size="20">mdi-calendar-blank</v-icon>
                    <div class="text-caption">No record</div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div> -->
          <v-container v-else fluid>
            <v-row class="text-center font-weight-bold custom-7-cols">
              <v-col v-for="(day, index) in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="index" class="bg-grey-lighten-4">
                {{ day }}
              </v-col>
            </v-row>

            <v-row class="custom-7-cols">
              <v-col
                v-for="(day, index) in calendarDays"
                :key="index"
                cols="2"
                class="calendar-cell"
              >
                <v-card
                  :color="day.record ? getCalendarDayColor(day.record) : ''"
                  :variant="day.record ? 'tonal' : 'outlined'"
                  class="pa-3 calendar-day"
                  @click="day.record && selectRecord(null, { item: day.record })"
                >
                  <div class="text-caption text-grey-darken-1">
                    {{ day.date ? formatCalendarDate(day.date) : '' }}
                  </div>
                  <div v-if="day.record" class="mt-2">
                    <div class="text-body-2 font-weight-medium">
                      {{ formatTime(day.record.start_time) }} - {{ formatTime(day.record.end_time) }}
                    </div>
                    <div class="text-caption">
                      {{ formatDuration(day.record.duration) }}
                    </div>
                    <v-chip size="x-small" :color="getStatusColor(day.record.status)" class="mt-1">
                      {{ day.record.status }}
                    </v-chip>
                  </div>
                  <div v-else-if="day.date" class="text-center text-grey-lighten-1 mt-2">
                    <v-icon size="20">mdi-calendar-blank</v-icon>
                    <div class="text-caption">No record</div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
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
              <div class="text-h6 font-weight-medium mb-1">{{ employee.name }}</div>
              <p class="text-caption text-grey-darken-1 mb-3">Record #{{ selectedRecord.id }}</p>
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
            <span class="text-h6 font-weight-medium">Add New Record for {{ employee.name }}</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newRecordForm">
            <v-row>
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
import router from "@/router"

// Props to receive employee ID from parent component or route
const props = defineProps({
  employeeId: {
    type: [String, Number],
    required: true
  }
})

const records = ref([])
const employee = ref({ id: props.employeeId, name: '', department: '' })
const shifts = ref([])
const selectedRecord = ref(null)
const isEditing = ref(false)
const statusFilter = ref("")
const dateFilter = ref("")
const monthFilter = ref("")
const viewMode = ref("table") // 'table' or 'calendar'

const headers = [
  { title: "Date", key: "start_date", width: "120px", sortable: true },
  { title: "Start", key: "start_time", width: "120px", sortable: false },
  { title: "End", key: "end_time", width: "120px", sortable: false },
  { title: "Duration", key: "duration", width: "100px", sortable: true },
  { title: "Status", key: "status", width: "120px", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "150px", align: "center" },
]

const statusOptions = ["IN", "OUT", "MISSED_CHECKOUT", "REGULARIZED", "ABSENT"]

const monthOptions = [
  { title: "January", value: "01" },
  { title: "February", value: "02" },
  { title: "March", value: "03" },
  { title: "April", value: "04" },
  { title: "May", value: "05" },
  { title: "June", value: "06" },
  { title: "July", value: "07" },
  { title: "August", value: "08" },
  { title: "September", value: "09" },
  { title: "October", value: "10" },
  { title: "November", value: "11" },
  { title: "December", value: "12" },
]

const newRecordDialog = ref(false)
const newRecord = ref({
  start_date: "",
  start_time: "",
  end_time: "",
  shift_id: "",
  duration: "",
})

const shiftOptions = computed(() => 
  shifts.value.map(shift => ({ id: shift.id, name: shift.name }))
)

const filteredRecords = computed(() => {
  let filtered = records.value

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(record => record.status === statusFilter.value)
  }

  // Date filter
  if (dateFilter.value) {
    filtered = filtered.filter(record => record.start_date === dateFilter.value)
  }

  // Month filter
  if (monthFilter.value) {
    filtered = filtered.filter(record => {
      const recordMonth = record.start_date.split('-')[1]
      return recordMonth === monthFilter.value
    })
  }

  return filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
})

// Monthly statistics
const monthlyStats = computed(() => {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  const currentMonthRecords = records.value.filter(record => {
    const [day, month, year] = record.start_date.split('-')
    const recordDate = new Date(year, month - 1, day)
    return recordDate.getMonth() + 1 === currentMonth && recordDate.getFullYear() === currentYear
  })

  return {
    presentDays: currentMonthRecords.length,
    currentMonth: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }),
    totalHours: currentMonthRecords.reduce((sum, r) => sum + (parseFloat(r.duration) || 0), 0).toFixed(1),
    missedCheckouts: currentMonthRecords.filter(r => r.status === 'MISSED_CHECKOUT').length
  }
})

// Calendar view data
const calendarDays = computed(() => {
  const currentMonth = new Date().getMonth();
  console.log("Current month", currentMonth)
  const currentYear = new Date().getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startWeekday = startOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const days = []

  // Add empty days before 1st of month
  for (let i = 0; i < startWeekday; i++) {
    days.push({ date: null, record: null });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day+1)
    const dateStr = date.toISOString().split('T')[0]
    const revDateStr = dateStr.split('-').reverse().join('-')
    const record = records.value.find(r => r.start_date === revDateStr)
    
    days.push({
      date: dateStr,
      record: record
    })
  }
  console.log(days[startWeekday])
  return days
})

// API Functions
const fetchRecords = async () => {
  try {
    const res = await axios.get(`/api/records/employee/${props.employeeId}`)
    records.value = res.data
  } catch (error) {
    console.error("Error fetching records:", error)
  }
}

const fetchEmployee = async () => {
  try {
    const res = await axios.get(`/api/employees/${props.employeeId}`)
    employee.value = res.data
  } catch (error) {
    console.error("Error fetching employee:", error)
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
    await axios.patch(`/api/records/${id}`, { status: "OUT" })
    await fetchRecords()
    if (selectedRecord.value?.id === id) {
      selectedRecord.value.status = "OUT"
    }
  } catch (error) {
    console.error("Error approving record:", error)
  }
}

const rejectRecord = async (id) => {
  try {
    await axios.patch(`/api/records/${id}`, { status: "MISSED_CHECKOUT" })
    await fetchRecords()
    if (selectedRecord.value?.id === id) {
      selectedRecord.value.status = "MISSED_CHECKOUT"
    }
  } catch (error) {
    console.error("Error rejecting record:", error)
  }
}

const regularizeRecord = (id) => {
  router.push(`/regularise/${id}`)
  // const record = records.value.find(r => r.id === id)
  // if (record) {
  //   selectRecord(null, { item: record })
  //   setTimeout(() => {
  //     isEditing.value = true
  //   }, 100)
  // }
}

const openNewRecordDialog = () => {
  newRecord.value = {
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
    // Add employee ID to the record before sending
    const recordData = {
      ...newRecord.value,
      emp_id: props.employeeId
    }
    await axios.post("/api/records/new", recordData)
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
  statusFilter.value = ""
  dateFilter.value = ""
  monthFilter.value = ""
}

const exportRecords = () => {
  // Convert records to CSV format
  const headers = ['Employee ID', 'Employee Name', 'Date', 'Start Time', 'End Time', 'Duration', 'Status']
  const csvContent = [
    headers.join(','),
    ...filteredRecords.value.map(record => [
      employee.value.id,
      employee.value.name,
      formatDate(record.start_date),
      formatTime(record.start_time),
      formatTime(record.end_time),
      formatDuration(record.duration),
      record.status
    ].join(','))
  ].join('\n')
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${employee.value.name}_attendance_records.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Helper functions
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
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    // YYYY-MM-DD format
    date = new Date(dateStr)
  } else {
    // DD-MM-YYYY format
    const [day, month, year] = dateStr.split('-')
    date = new Date(year, month - 1, day)
  }
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

const formatCalendarDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short'
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return "--:--"
  // Handle full datetime format "YYYY-MM-DD HH:MM:SS" or just "HH:MM:SS"
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
  if (!duration) return "-- --"
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

const getStatusTextClass = (status) => {
  return ""  // Let Vuetify handle the text color based on the chip color
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

const getCalendarDayColor = (record) => {
  if (!record) return "grey-lighten-4"
  
  switch (record.status) {
    case "OUT":
    case "REGULARIZED":
      return "success-lighten-4"
    case "MISSED_CHECKOUT":
      return "warning-lighten-4"
    case "ABSENT":
      return "error-lighten-4"
    default:
      return "info-lighten-4"
  }
}

onMounted(() => {
  fetchRecords()
  fetchEmployee()
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

.record-form :deep(.v-field--disabled .v-field__overlay) {
  background-color: rgba(0, 0, 0, 0.02);
}

.calendar-day {
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 120px;
}

.calendar-day:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
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

:deep(.v-chip__content) {
  font-weight: 500;
}

.custom-7-cols .v-col {
  flex-basis: calc(100% / 7);
  max-width: calc(100% / 7);
}
</style>