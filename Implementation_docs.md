- poll for existing events, check event status, create events basexd on open time slots, update event (crud)
- event schema 
    - id serial
    - name: text 
    - date   -- index
    - start_time[Optional]   -- index 
    - duration [INT] (number of seconds)
    - attendees: list<text>
    - location: text 


