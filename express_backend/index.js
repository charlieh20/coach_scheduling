const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const db = require('./requests')
const port = 80;

app.use(cors());

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/users/name/:name', db.getUserByName);
app.get('/slots/count', db.countSlots)
app.get('/slots', db.getSlots);
app.post('/slots', db.postSlot);
app.put('/slots', db.claimSlot);
app.get('/reviews/count/:coach', db.countReviews);
app.get('/reviews/:coach', db.getReviewsByCoach);
app.post('/reviews', db.postReview);

app.listen(port, () => {
  console.log(`App listening on port ${port}...`)
});