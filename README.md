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


### Implementation
Events Schema:

|Field|Constraints|Notes
|----|-----|-----
|id|Serial| 
|event_name|text, not null|
|start_timestamp|TIMESTAMP not null| indexed
|end_timestamp|TIMESTAMP not null| indexed
|attendees|text[], not null|
|event_location|text, not null|

### Endpoints 
1) **poll for existing events --> GET(/events/:id)**

2) **poll for status...  --> GET(/events/status/:id)**
- pull start_time and end_time 
- if time.now() > end_time -> completed
- time.now() < start_time -> pending 
- start_time < time.now() > end_time -> in progress

3) **Create events... --> POST(/events)**

Payload:

|Field|Notes
|----|----|
|event_name|
|date| Date format (YYYY-MM-DD)
|start_time|Time format (HH-MM-SS) [Optional]
|duration| number seconds|
|attendees| string[]
|event_location|string

- we will combine date and start_time to create a TIMESTAMP start_timestamp to insert into table
- using start_timestamp we add duration to get end_timestamp

- Before we add an event, we check for collisions by querying all events where:
event.end_timestamp > current_event.start_timestamp and event.end_timestamp < current_event.end_timestamp
    - if a match is found, return 409

4) **Update events... --> PUT(/events/:id)**

5) **Delete events --> DELETE(/events/:id)**

6) notify if event can't be added... during post(/events), check if open time slot if not open return 409 (conflict)


### Follow ups:
1. How might we account for the schedules of multiple attendees?
    
    A: We'd create a users table and have events depend on users. The endpoints that would change would be the endpoint to create an event, and the endpoint to update an event. We'd pass in all relevant users, and instead of doing a collision check for one user only, we'd do it for every user.

2. Event schema would be updated with a field, `attachments`, with type JSONB[], representing attachments as binary being included. Update the POST endpoint to take in attachments as well.

3. In the POST (/events/) endpoint to create an event, enforce another check that start_timestamp and end_timestamp be in a certain time frame (i.e. 8:00AM to 5:00PM).