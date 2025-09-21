import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import pgp from 'pg-promise';

const pg = pgp()
const db = pg({
    host: 'localhost',
    port: 5432,
    database: 'scheduler_api_design_db'
})

const app = express()
app.use(express.json())
const port = 3000

// poll for existing events 
app.get("/events/:id", async (req: Request, res: Response) => {
    const query = "SELECT * from events WHERE id = $1";
    const results = await db.oneOrNone(query, [req.params.id]);
    if (!results) {
        return res.status(404).send("No matching event id was found")
    }
    return res.status(200).json(results);
});

// check event status 
app.get("/events/status/:id", async (req: Request, res: Response) => {
    const results = await db.oneOrNone("SELECT start_timestamp, end_timestamp from events where id = $1", [req.params.id]);
    if (!results) {
        return res.status(404).send("No matching event id was found");
    }
    const startTime = new Date(results.start_timestamp);
    const endTime = new Date(results.end_timestamp);
    const timeNow = new Date();
    let status;
    if (startTime < timeNow) {
        status = 'pending';
    } 
    else if (startTime >= timeNow && timeNow <= endTime) {
        status = 'in progress'
    }
    else {
        status = 'completed'
    }
    return res.status(200).json(
        {
            "status": status
        }
    )
});


// create events 
app.post('/events', async (req: Request, res: Response) => {
    //enforce the payload: we need event_name, event_date, duration, attendees, event_location
    if (!(req.body.event_name && req.body.event_date && req.body.duration && req.body.attendees && req.body.event_location)) {
        res.status(400).send("Malformed payload");
    }

    // if start_time is not provided, we give it a proper start_time 
    let startTimestampString = `${req.body.event_date}T${req.body.start_time}`;
    //check for collisions
    const startTime = new Date(startTimestampString);
    const endTime = new Date();
    endTime.setTime(startTime.getTime() + (parseInt(req.body.duration)) * 1000);
    const endTimestamp = endTime.toISOString();

    const collisions = await db.any("SELECT id from events WHERE start_timestamp >= $1 and end_timestamp <= $2", [startTimestampString, endTimestamp]);
    if (collisions.length != 0) {
        res.status(409).json("There is an overlapping event already created.")
    }

    const query = "INSERT into events (event_name, start_timestamp, end_timestamp, attendees, event_location) VALUES ($1, $2, $3, $4, $5) RETURNING id;"
    const results = db.one(query, [req.body.event_name, startTimestampString, endTimestamp, req.body.attendees, req.body.event_location]);
    res.status(201).json(results);
}); 

// update events 
app.put('/events/:id', async (req: Request, res: Response) => {
    if (!(req.body.event_name && req.body.event_date && req.body.duration && req.body.attendees && req.body.event_location)) {
        res.status(400).send("Malformed payload");
    }
    let startTimestampString = `${req.body.event_date}T${req.body.start_time}`;
    //check for collisions
    const startTime = new Date(startTimestampString);
    const endTime = new Date();
    endTime.setTime(startTime.getTime() + (parseInt(req.body.duration)) * 1000);

    const endTimestamp = endTime.toISOString();
    const collisions = await db.any("SELECT id from events WHERE start_timestamp >= $1 and end_timestamp <= $2", [startTimestampString, endTimestamp]);
    if (collisions.length != 0) {
        res.status(409).json("There is an overlapping event already created.")
    }

    // no overlap, update 
    const updateQuery = "UPDATE events SET event_name = $1, start_timestamp = $2, end_timestamp = $3, attendees = $4, event_location = $5 WHERE id = $6 RETURNING id;"
    const results = await db.oneOrNone(updateQuery, [req.body.event_name, startTimestampString, endTimestamp, req.body.attendees, req.body.event_location, req.params.id]);
    if (!results) {
        res.status(404).send("No matching id was found")
    }
    res.status(200).json(results);
});

// delete events
app.delete('/events/:id', async(req: Request, res: Response) => {
    console.log(req.params.id);
    const result = await db.oneOrNone("DELETE from events WHERE id = $1", [req.params.id]);
    if (!result) {
        res.status(404).send("No matching id found");
    }
    res.status(200).json(result);
});

// asyncErrorHandler: Used to forward async errors 
function asynncErrorHandler(fn: (req: Request, res: Response, next:NextFunction) => Promise<any>) {
    return function(req: Request, res:Response, next:NextFunction) {
        // if error, catch and forward it to next 
        return fn(req, res, next).catch(next);
    }
}
// error handling middleware 
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // if there is an error, throw a 500 
    console.log(err.stack);
    res.status(500).send("Internal server error")
});

app.listen(port, () => {
    console.log("app listening on port 3000")
});