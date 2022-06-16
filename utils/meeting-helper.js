const meetingServices = require('../services/meeting.service');
const { MeetingPayloadEnum } = require('./meeting-payload.enum');

const joinMeeting = async (meetingId, socket, meetingServer, payload) => {
  const { userId, name } = payload.data;

  meetingServices.isMeetingHappening(meetingId, async (error, results) => {
    if (error && !results) {
      sendMessage(socket, { type: MeetingPayloadEnum.NOT_FOUND });
    }

    if (results) {
      addUser(socket, { meetingId, userId, name }).then(
        (result) => {
          if (result) {
            sendMessage(socket, {
              type: MeetingPayloadEnum.JOINED_MEETING,
              data: { userId },
            });

            broadcastUsers(meetingId, socket, meetingServer, {
              type: MeetingPayloadEnum.USER_JOINED,
              data: {
                userId,
                name,
                ...payload.data,
              },
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  });
};

const forwardConnectionRequest = (
  meetingId,
  socket,
  meetingServer,
  payload
) => {
  const { userId, otherUserId, name } = payload.data;
  let model = { meetingId: meetingId, userId: otherUserId };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      let sendPayload = JSON.stringify({
        type: MeetingPayloadEnum.CONNECTION_REQUEST,
        data: {
          userId,
          name,
          ...payload.data,
        },
      });
      meetingServer.to(results.socketId).emit('message', sendPayload);
    }
  });
};

const forwardIceCandidate = (meetingId, socket, meetingServer, payload) => {
  const { userId, otherUserId, candidate } = payload.data;
  let model = { meetingId: meetingId, userId: otherUserId };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      let sendPayload = JSON.stringify({
        type: MeetingPayloadEnum.ICECANDIDATE,
        data: {
          userId,
          candidate,
        },
      });
      meetingServer.to(results.socketId).emit('message', sendPayload);
    }
  });
};

const forwardOfferSDP = (meetingId, socket, meetingServer, payload) => {
  const { userId, otherUserId, sdp } = payload.data;
  let model = { meetingId: meetingId, userId: otherUserId };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      let sendPayload = JSON.stringify({
        type: MeetingPayloadEnum.OFFER_SDP,
        data: {
          userId,
          sdp,
        },
      });
      meetingServer.to(results.socketId).emit('message', sendPayload);
    }
  });
};

const forwardAnswerSDP = (meetingId, socket, meetingServer, payload) => {
  const { userId, otherUserId, sdp } = payload.data;
  let model = { meetingId: meetingId, userId: otherUserId };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      let sendPayload = JSON.stringify({
        type: MeetingPayloadEnum.ANSWER_SDP,
        data: {
          userId,
          sdp,
        },
      });
      meetingServer.to(results.socketId).emit('message', sendPayload);
    }
  });
};

const userLeft = (meetingId, socket, meetingServer, payload) => {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: MeetingPayloadEnum.USER_LEFT,
    data: {
      userId: userId,
    },
  });
};

const endMeeting = (meetingId, socket, meetingServer, payload) => {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: MeetingPayloadEnum.MEETING_ENDED,
    data: {
      userId: userId,
    },
  });

  meetingServices.getMeetingUsers(meetingId, (error, results) => {
    for (let i = 0; i < results.length; i++) {
      const meetingUser = results[i];
      meetingServer.sockets.connected[meetingUser.socketId].disconnect();
    }
  });
};

const forwardEvent = (meetingId, socket, meetingServer, payload) => {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: payload.type,
    data: {
      userId: userId,
      ...payload.data,
    },
  });
};

const addUser = (socket, { meetingId, userId, name }) => {
  let promise = new Promise((resolve, reject) => {
    meetingServices.getMeetingUser({ meetingId, userId }, (error, results) => {
      if (!results) {
        let model = {
          socketId: socket.id,
          meetingId: meetingId,
          userId: userId,
          joined: true,
          name: name,
          isAlive: true,
        };
        meetingServices.joinMeeting(model, (error, results) => {
          if (results) {
            resolve(true);
          }

          if (error) {
            reject(error);
          }
        });
      } else {
        meetingServices.updateMeetingUser(
          {
            userId: userId,
            socketId: socket.id,
          },
          (error, results) => {
            if (results) {
              resolve(true);
            }

            if (error) {
              reject(error);
            }
          }
        );
      }
    });
  });

  return promise;
};

const sendMessage = (socket, payload) => {
  socket.send(JSON.stringify(payload));
};

const broadcastUsers = (meetingId, socket, meetingServer, payload) => {
  socket.broadcast.emit('message', JSON.stringify(payload));
};

module.exports = {
  joinMeeting,
  forwardConnectionRequest,
  forwardIceCandidate,
  forwardOfferSDP,
  forwardAnswerSDP,
  userLeft,
  endMeeting,
  forwardEvent,
};
