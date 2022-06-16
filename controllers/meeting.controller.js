const meetingServices = require('../services/meeting.service');

exports.startMeeting = (req, res, next) => {
  const { hostId, hostName } = req.body;

  let model = { hostId: hostId, hostName: hostName, startTime: Date.now() };

  meetingServices.startMeeting(model, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({ message: 'Success', data: results.id });
  });
};

exports.checkMeetingExists = (req, res, next) => {
  const meetingId = req.query;

  meetingServices.checkMeetingExists(meetingId, (error, results) => {
    if (error) {
      return next(error);
    }

    return res.status(200).send({ message: 'Success', data: results });
  });
};

exports.getMeetingUsers = (req, res, next) => {
  const meetingId = req.query;
  meetingServices.getMeetingUsers(meetingId, (error, results) => {
    if (error) {
      return next(error);
    }
    return res.status(200).send({ message: 'Success', data: results });
  });
};
