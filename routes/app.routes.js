const meetingController = require('../controllers/meeting.controller');
const express = require('express');
const router = express.Router();

router.post('/meeting/start', meetingController.startMeeting);
router.get('/meeting/join', meetingController.checkMeetingExists);

router.get('/meeting/get', meetingController.getMeetingUsers);

module.exports = router;
