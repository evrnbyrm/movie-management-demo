import { Ticket } from './ticket.entity'

export function isTicketTimeValid(ticket: Ticket): boolean {
  const now = new Date()
  const startTime = new Date(`${ticket.session.date}T${ticket.session.time_slot.split('-')[0]}Z`)
  const endTime = new Date(`${ticket.session.date}T${ticket.session.time_slot.split('-')[1]}Z`)

  if (now >= startTime && now <= endTime) {
    return true
  }
  return false
}
