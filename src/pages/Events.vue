<template>
      <div class="page-header">
        <h2>Events</h2>
        <v-btn
          color="primary"
          class="ms-auto"
          :disabled="!canEdit"
          @click="openDialog()"
          aria-label="Add event"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Event
        </v-btn>
      </div>

      <!-- Search & Filters -->
      <v-row align="center" class="filters-row mb-6" dense>
        <v-col cols="12" md="4" lg="3">
          <v-text-field
            v-model="filters.search"
            label="Search by name"
            clearable
            dense
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="fetchEventList"
          />
        </v-col>

        <v-col cols="12" md="4" lg="3">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            max-width="350"
            min-width="auto"
            offset-y
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="formattedDateRange"
                label="Filter by date range"
                prepend-inner-icon="mdi-calendar-range"
                readonly
                v-bind="attrs"
                v-on="on"
                dense
                clearable
              />
            </template>

            <v-date-picker
              v-model="filters.dates"
              :range="true"
              scrollable
              @change="applyDateFilter"
            >
              <v-spacer />
              <v-btn text color="primary" @click="dateMenu = false">Close</v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>

        <v-col cols="12" md="4" lg="3">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Status"
            dense
            clearable
            return-object
            item-title="text"
            item-value="value"
            prepend-inner-icon="mdi-filter-variant"
          />
        </v-col>
      </v-row>

    <!-- Events Data Table -->
    <v-card outlined>
      <v-data-table
        :headers="headers"
        :items="events"
        :items-per-page="pagination.itemsPerPage"
        :page="pagination.page"
        :loading="loading"
        :loading-text="'Loading events...'"
        :footer-props="{
          'items-per-page-options': [5, 10, 25, 50],
          'show-current-page': true,
          'show-first-last-page': true,
        }"
        :sort-by="sortBy"
        :sort-desc="sortDesc"
        @update:page="updatePage"
        @update:items-per-page="updateItemsPerPage"
        @update:sort-by="updateSortBy"
        @update:sort-desc="updateSortDesc"
        class="events-table"
        dense
        fixed-header
        height="600"
      >
        <template #item.status="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            text-color="white"
            small
            class="ma-1"
            >{{ capitalize(item.status) }}</v-chip
          >
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon
            color="primary"
            :disabled="!canEdit"
            @click="openDialog(item)"
            :aria-label="`Edit event ${item.eventName}`"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            color="red darken-2"
            :disabled="!canEdit"
            @click="confirmDelete(item)"
            :aria-label="`Delete event ${item.eventName}`"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <template #no-data>
          <v-alert type="info" border="left" color="blue lighten-4" icon="mdi-information-outline">
            No events found matching criteria.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Event Dialog -->
    <v-dialog v-model="dialog.show" persistent max-width="600px" scrollable>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ dialog.isEdit ? 'Edit Event' : 'Add Event' }}</span>
          <v-spacer />
          <v-btn icon @click="closeDialog" aria-label="Close dialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid" lazy-validation>
            <v-text-field
              v-model="form.eventName"
              label="Event Name"
              :rules="[rules.required]"
              required
            />
            <v-textarea
              v-model="form.description"
              label="Description"
              :rules="[rules.required]"
              required
              rows="3"
            />
            <v-row>
              <v-col cols="12" md="6">
                <v-menu
                  v-model="startMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="form.startDate"
                      label="Start Date"
                      prepend-inner-icon="mdi-calendar-start"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[rules.required]"
                      required
                      dense
                    />
                  </template>
                  <v-date-picker v-model="form.startDate" @input="startMenu = false" />
                </v-menu>
              </v-col>
              <v-col cols="12" md="6">
                <v-menu
                  v-model="endMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="form.endDate"
                      label="End Date"
                      prepend-inner-icon="mdi-calendar-end"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[rules.required, validateEndAfterStart]"
                      required
                      dense
                    />
                  </template>
                  <v-date-picker v-model="form.endDate" @input="endMenu = false" />
                </v-menu>
              </v-col>
            </v-row>
            <v-select
              v-model="form.status"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              label="Status"
              :rules="[rules.required]"
              required
              dense
            />
          </v-form>
          <v-alert
            v-if="dialog.error"
            type="error"
            dense
            class="mt-4"
            border="left"
            icon="mdi-alert-circle-outline"
          >
            {{ dialog.error }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog" :disabled="dialog.loading">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="dialog.loading"
            :disabled="!formValid"
            @click="saveEvent"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete event "<strong>{{ deleteDialog.event?.eventName }}</strong>"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog.show = false" :disabled="deleteDialog.loading">Cancel</v-btn>
          <v-btn
            color="red darken-1"
            :loading="deleteDialog.loading"
            @click="deleteEventConfirmed"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/services/events.js'
import { useRouter, useRoute } from 'vue-router'

// Reactive state for events list and filters
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const filters = reactive({
  search: '',
  dates: { start: null, end: null },
  status: null,
})

const dateMenu = ref(false)
const formattedDateRange = computed(() => {
  if (!filters.dates.start && !filters.dates.end) return ''
  if (filters.dates.start && !filters.dates.end)
    return filters.dates.start
  if (!filters.dates.start && filters.dates.end)
    return filters.dates.end
  return `${filters.dates.start} - ${filters.dates.end}`
})

const applyDateFilter = (val) => {
  filters.dates = val
  dateMenu.value = false
  fetchEventList()
}

const loading = ref(false)
const events = ref([])

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
})

const sortBy = ref('startDate')
const sortDesc = ref(false)

const headers = [
  { title: 'Event ID', value: 'eventId', sortable: true, width: '100' },
  { title: 'Event Name', value: 'eventName', sortable: true },
  { title: 'Start Date', value: 'startDate', sortable: true },
  { title: 'End Date', value: 'endDate', sortable: true },
  { title: 'Status', value: 'status', sortable: true, align: 'center', width: '120' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '130' },
]

// Status options for select & filter
const statusOptions = [
  { text: 'Upcoming', value: 'upcoming' },
  { text: 'Ongoing', value: 'ongoing' },
  { text: 'Completed', value: 'completed' },
]

// Access control based on user roles
const canEdit = computed(() => userStore.isAdmin || userStore.isSuperAdmin)

// Dialog form state
const dialog = reactive({
  show: false,
  isEdit: false,
  loading: false,
  error: null,
})

// Form ref & validation
const form = reactive({
  eventId: null,
  eventName: '',
  description: '',
  startDate: null,
  endDate: null,
  status: null,
})

const formValid = ref(false)
const formRef = ref(null)

// Date picker menus for form fields
const startMenu = ref(false)
const endMenu = ref(false)

// Validation rules
const rules = {
  required: (v) => (!!v && v !== '') || 'This field is required',
}

const validateEndAfterStart = (val) => {
  if (!form.startDate || !val) return true
  return val >= form.startDate || 'End date cannot be before start date'
}

// Capitalize helper
function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Map status to color
function statusColor(status) {
  switch (status) {
    case 'upcoming':
      return 'blue lighten-2'
    case 'ongoing':
      return 'green lighten-1'
    case 'completed':
      return 'grey lighten-1'
    default:
      return 'grey'
  }
}

// Fetch events list with filters, pagination, sorting
async function fetchEventList() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.itemsPerPage,
      search: filters.search || undefined,
      startDate: filters.dates.start || undefined,
      endDate: filters.dates.end || undefined,
      status: filters.status?.value || undefined,
      sortBy: sortBy.value,
      sortDesc: sortDesc.value,
    }
    const res = await fetchEvents(params)
    // Assume response format includes: data (array), total (number)
    events.value = res.data.data || []
    pagination.totalItems = res.data.total || 0
  } catch (error) {
    console.error('Failed to load events:', error)
    // Optionally show error notification here
  } finally {
    loading.value = false
  }
}

// Open dialog to add or edit event
function openDialog(event = null) {
  clearForm()
  dialog.show = true
  dialog.error = null
  dialog.isEdit = !!event
  if (dialog.isEdit) {
    // Load event details into form
    form.eventId = event.eventId
    form.eventName = event.eventName
    form.description = event.description
    form.startDate = event.startDate
    form.endDate = event.endDate
    form.status = statusOptions.find((s) => s.value === event.status) || null
  }
}

// Clear form values
function clearForm() {
  form.eventId = null
  form.eventName = ''
  form.description = ''
  form.startDate = null
  form.endDate = null
  form.status = null
  formValid.value = false
  if (formRef.value) formRef.value.resetValidation()
}

// Close dialog
function closeDialog() {
  dialog.show = false
  dialog.error = null
  clearForm()
}

// Save event (create or update)
async function saveEvent() {
  if (!formValid.value) return

  dialog.loading = true
  dialog.error = null

  // Prepare payload for API, convert startDate and endDate to backend format if needed
  const payload = {
    eventName: form.eventName.trim(),
    description: form.description.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    status: form.status.value,
  }

  try {
    if (dialog.isEdit) {
      await updateEvent(form.eventId, payload)
    } else {
      await createEvent(payload)
    }
    dialog.show = false
    fetchEventList()
  } catch (err) {
    dialog.error = err.response?.data?.msg || err.message || 'Error saving event'
  } finally {
    dialog.loading = false
  }
}

// Pagination and sorting handlers
function updatePage(newPage) {
  pagination.page = newPage
  fetchEventList()
}

function updateItemsPerPage(newItemsPerPage) {
  pagination.itemsPerPage = newItemsPerPage
  pagination.page = 1
  fetchEventList()
}

function updateSortBy(newSortBy) {
  sortBy.value = newSortBy || 'startDate'
  fetchEventList()
}

function updateSortDesc(newSortDesc) {
  sortDesc.value = newSortDesc || false
  fetchEventList()
}

// Delete confirmation dialog state
const deleteDialog = reactive({
  show: false,
  event: null,
  loading: false,
})

function confirmDelete(event) {
  deleteDialog.event = event
  deleteDialog.show = true
}

// Confirm delete event
async function deleteEventConfirmed() {
  if (!deleteDialog.event) return

  deleteDialog.loading = true
  try {
    await deleteEvent(deleteDialog.event.eventId)
    deleteDialog.show = false
    fetchEventList()
  } catch (err) {
    // Alert or notify error
    alert('Failed to delete event')
  } finally {
    deleteDialog.loading = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchEventList()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters-row {
  gap: 1rem;
}

.events-table {
  font-size: 0.9rem;
}

.v-data-table .v-data-table__wrapper {
  max-height: 600px;
}

/* Make datatable header sticky */
.v-data-table-header {
  position: sticky !important;
  top: 0;
  background: white;
  z-index: 10;
}

/* Status badges styling */
.v-chip {
  font-weight: 600;
  text-transform: capitalize;
}

/* Dialog required field asterisk Color */
.v-label.v-label--active .v-messages__message:before {
  color: #d9534f;
}

/* Responsive tweaks */
@media (max-width: 960px) {
  .page-header,
  .filters-row {
    flex-direction: column;
  }
}
</style>
