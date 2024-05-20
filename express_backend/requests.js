const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'coach-scheduling',
    password: 'password',
    port: 5432,
});


// USER QUERIES
const getUserByName = (req, res) => {
    const name = req.params.name

    if (name) {
        pool.query('SELECT * FROM users WHERE name = $1', [name], (err, result) => {
            if (err) {
                throw (err)
            }
            res.status(200).json(result.rows)
        })
    } else {
        throw new Error('Invalid params.')
    }
}

// SLOT QUERIES
const getSlots = (req, res) => {
    const { id, role, page } = req.query;
    const offset = 5 * page;

    // if no id parameter given, get all non-booked slots
    let query = `
        SELECT
            slots.id AS id,
            users.name AS coach_name,
            users.phone AS coach_phone,
            slots.start_time AS time
        FROM slots
        JOIN users ON slots.coach_id = users.id
        WHERE slots.student_id IS NULL AND start_time > CURRENT_TIMESTAMP
        ORDER BY slots.start_time
        LIMIT 5 OFFSET $1`;
    let vars = [offset];

    // if id parameter is given, get slots associated with the given id
    if (id) {
        if (role == 'coach') {
            query = `
                SELECT
                    slots.id AS id,
                    student.name AS student_name,
                    student.phone AS student_phone,
                    slots.start_time AS time 
                FROM slots
                LEFT JOIN users AS student ON slots.student_id = student.id
                LEFT JOIN reviews ON slots.id = reviews.slot_id
                WHERE
                    coach_id = $1 AND
                    reviews.id IS NULL AND
                    (start_time > CURRENT_TIMESTAMP OR student_id IS NOT NULL)
                ORDER BY slots.start_time LIMIT 5 OFFSET $2`;
        } else {
            query = `
                SELECT
                    slots.id AS id,
                    coach.name AS coach_name,
                    coach.phone AS coach_phone,
                    slots.start_time AS time 
                FROM slots
                LEFT JOIN users AS coach ON slots.coach_id = coach.id
                LEFT JOIN reviews ON slots.id = reviews.slot_id
                WHERE
                    student_id = $1 AND
                    reviews.id IS NULL AND
                    start_time > CURRENT_TIMESTAMP
                ORDER BY slots.start_time LIMIT 5 OFFSET $2`;
        }
        vars = [id, offset];
    }

    pool.query(query, vars, (err, result) => {
        if (err) {
            throw (err)
        }
        res.status(200).json(result.rows)
    })
}

const countSlots = (req, res) => {
    const { id, role } = req.query;

    let query = `SELECT COUNT(*) FROM slots
        WHERE student_id IS NULL AND start_time > CURRENT_TIMESTAMP`;
    let vars = [];

    if (id) {
        if (role == 'coach') {
            query = `SELECT COUNT(*) FROM slots
                LEFT JOIN reviews ON slots.id = reviews.slot_id
                WHERE coach_id = $1 AND
                reviews.id IS NULL AND 
                (student_id IS NOT NULL OR start_time > CURRENT_TIMESTAMP)`;
        } else {
            query = `SELECT COUNT(*) FROM slots
                LEFT JOIN reviews ON slots.id = reviews.slot_id
                WHERE student_id = $1 AND
                reviews.id IS NULL AND 
                start_time > CURRENT_TIMESTAMP`;
        }
        vars = [id];
    }

    pool.query(query, vars, (err, result) => {
        if (err) throw (err);
        res.status(200).json(result.rows)
    });
}

const postSlot = (req, res) => {
    const { coach_id, time } = req.body;

    if (coach_id && time) {
        pool.query('SELECT start_time FROM slots WHERE coach_id=$1', [coach_id], (err, result) => {
            if (err) throw err;
            // check if slot overlaps with others for that coach
            const new_time = convertToDate(time);
            for (let i = 0; i < result.rows.length; i += 1) {
                const old_time = new Date(result.rows[i].start_time);
                const diff = Math.abs(new_time - old_time);
                if (diff / (1000*60*60) < 2) {
                    res.status(409).send('Time conflict with existing slot.');
                    return;
                }
            }
            pool.query('INSERT INTO slots (coach_id, start_time) VALUES ($1, $2)', [coach_id, time], (err, result) => {
                if (err) throw err;
                res.status(201).send(`Slot added with ID: ${result.insertId}`)
            });
        })
    } else {
        throw new Error('Invalid params.')
    }
}

const claimSlot = (req, res) => {
    const { student_id, slot_id } = req.body;

    if (student_id && slot_id) {
        pool.query('UPDATE slots SET student_id = $1 WHERE id = $2',
                [student_id, slot_id], (err, result) => {
            if (err) {
              throw err
            }
            res.status(200).send(`Slot claimed by student with ID: ${result.slot_id}`)
        });
    } else {
        throw new Error('Invalid params.')
    }
}

// REVIEW QUERIES
const getReviewsByCoach = (req, res) => {
    const coach_id = req.params.coach;
    const { page } = req.query;
    const offset = 5 * page;

    if (coach_id) {
        pool.query('SELECT reviews.id AS id, users.name AS student_name, reviews.score AS score, reviews.note AS note FROM reviews LEFT JOIN slots ON reviews.slot_id = slots.id LEFT JOIN users ON slots.student_id = users.id WHERE slots.coach_id = $1 LIMIT 5 OFFSET $2', 
                [coach_id, offset], (err, result) => {
            if (err) {
                throw (err)
            }
            res.status(200).json(result.rows)
        })
    } else {
        throw new Error('Invalid params.')
    }
}

const countReviews = (req, res) => {
    const coach_id = req.params.coach;

    if (coach_id) {
        pool.query('SELECT COUNT(*) FROM reviews JOIN slots ON slots.id = reviews.slot_id WHERE slots.coach_id = $1',
                [coach_id], (err, result) => {
            if (err) {
                throw err
            }
            res.status(200).json(result.rows)
        });
    } else {
        throw new Error('Invalid params.')
    }
}

const postReview = (req, res) => {
    const { slot_id, score, note } = req.body;

    if (slot_id && score && note) {
        pool.query('INSERT INTO reviews (slot_id, score, note) VALUES ($1, $2, $3)',
                [slot_id, score, note], (err, result) => {
            if (err) {
                throw err
            }
            res.status(201).send(`Review added with ID: ${result.insertId}`)
        });
    }
}

// UTILS
const convertToDate = (datetime) => {
    const d1 = datetime.split('-');
    const yr = d1[0];
    const mon = d1[1]-1;
    const d2 = d1[2].split(' ');
    const day = d2[0];
    const d3 = d2[1].split(':');
    const hr = d3[0];
    const min = d3[1];

    return new Date(yr, mon, day, hr, min)
}

module.exports = {
    getUserByName,
    getSlots,
    countSlots,
    postSlot,
    claimSlot,
    getReviewsByCoach,
    countReviews,
    postReview,
}