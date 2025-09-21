CREATE table events(
    id SERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    start_timestamp TIMESTAMPTZ NOT NULL,
    end_timestamp TIMESTAMPTZ NOT NULL,
    attendees TEXT[] NOT NULL,
    event_location TEXT NOT NULL
);

-- index start_timestamp
CREATE INDEX start_timestamp on events (start_timestamp);
CREATE INDEX end_timestamp on events (end_timestamp);