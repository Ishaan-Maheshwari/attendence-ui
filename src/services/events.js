// src/services/events.js
import axios from 'axios'

// Base URL is assumed as /api/events
const apiClient = axios.create({
  baseURL: '/api/events',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fetch events with query params (pagination, filters, search)
export function fetchEvents(params) {
  // params can include page, limit, search, startDate, endDate, status
  return apiClient.get('/', { params })
}

// Fetch single event by ID
export function fetchEvent(id) {
  return apiClient.get(`/${id}`)
}

// Create a new event
export function createEvent(eventData) {
  return apiClient.post('/', eventData)
}

// Update an existing event
export function updateEvent(id, eventData) {
  return apiClient.put(`/${id}`, eventData)
}

// Delete event by ID
export function deleteEvent(id) {
  return apiClient.delete(`/${id}`)
}
