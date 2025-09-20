# scheduler-api-design

## Problem
The CEO, Jeff Blumba, has several secretaries who are overbooked and have too many events in their backlog to plan for Jeff. Your job is to design an API to be triggered by an auto event manager (assume that service is already implemented). This API should be able to poll for existing events, check event status, create events based on open time slots on the CEO's calendar, and update events. 

### Functional Requirements
1. Service users should be able to poll for existing events and get info about them (name, time, attendees, location, etc.). Time is optional. Date and time overrides the any events inserted automatically.
2. Service users should be able to check an event's status (i.e. pending, in progress, completed, etc.)
3. Service users should be able to create events to be auto inserted into open time slots on the calendar.
4. Service users should be able to update events (status, date, time, name, attendees, etc.).
5. Service users should be able to delete and cancel events.
6. Service users should be notified if an event cannot be placed on the CEO's calendar.


### Assumptions
1. For the scope of this problem, we can assume that we are only dealing with the CEO's calendar and scheduling based on his availability. Other attendees' calendars do not matter.
2. No two events for the CEO can overlap in time in the schedule.
3. The algorithm to auto insert based on open time slots in the calendar is already implemented. It's sort of related to this [problem](https://leetcode.com/problems/insert-interval/description/).
4. The auto event manager service is already implemented. Any requests to this scheduler-api needs to be authenticated to verify that it is the auto event manager service making requests.
5. There is high throughput of events attempted to be added to the CEO's calendar everyday (up to a thousand a day). He is very popular.

### Follow Ups
1. How might we account for the schedules of multiple attendees?
2. How might we add file attachments and materials to events?
3. How might we limit the time frame we can automatically schedule events for?