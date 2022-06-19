const meeting = require('../models/meeting.model');
const user = require('../models/user.model');

const getMeetingUsers = async (meetId, callback) => {
  user
    .find({ meetingId: meetId })
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
};

const startMeeting = async (params, callback) => {
  const meetingSchema = new meeting(params);
  meetingSchema
    .save()
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
};

const joinMeeting = async (params, callback) => {
  const userModel = new user(params);

  userModel
    .save()
    .then(async (response) => {
      await meeting.findOneAndUpdate(
        { id: params.meetingId },
        { $addToSet: { users: userModel } }
      );
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
};

const isMeetingHappening = async (meetingId, callback) => {
  meeting
    .findById(meetingId)
    .populate('users', 'User')
    .then((response) => {
      if (!response) callback('Invalid meeting Id');
      else callback(null, true);
    })
    .catch((error) => {
      return callback(error, false);
    });
};

const checkMeetingExists = async (meetingId, callback) => {
  meeting
    .findById(meetingId)
    .populate('users', 'User')
    .then((response) => {
      if (!response) callback('Invalid meeting Id');
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error, false);
    });
};

const getMeetingUser = async (params, callback) => {
  const { meetingId, userId } = params;

  user
    .find({ meetingId, userId })
    .then((response) => {
      return callback(null, response[0]);
    })
    .catch((error) => {
      return callback(error);
    });
};

const updateMeetingUser = async (params, callback) => {
  user
    .updateOne({ userId: params.userId }, { $set: params }, { new: true })
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
};

const getUserBySocketId = async (params, callback) => {
  const { meetingId, socketId } = params;

  user
    .find({ meetingId, socketId })
    .limit(1)
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
};

module.exports = {
  getMeetingUsers,
  startMeeting,
  joinMeeting,
  isMeetingHappening,
  checkMeetingExists,
  getMeetingUser,
  updateMeetingUser,
  getUserBySocketId,
};
