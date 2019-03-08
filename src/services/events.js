/* eslint camelcase: "off" */

const fb = require("fb");
const moment = require("moment");
const { facebookToken, facebookPageId } = require("../../config/secrets");

const FB = new fb.Facebook({ version: "v3.2" });
FB.setAccessToken(facebookToken);

const extractNearestDate = event => {
  const result = {
    start_time: event.start_time,
    end_time: event.end_time
  };

  if (event.event_times) {
    const upcoming = event.event_times.filter(
      t => new Date(t.start_time) > new Date()
    );
    const sorted = upcoming.sort(
      (a, b) => new Date(a.start_time) > new Date(b.start_time)
    );

    result.start_time = sorted[0].start_time;
    result.end_time = sorted[0].end_time;
  }

  return result;
};

const stringifyEventDate = eventDate => {
  let result = "";
  const start = moment(eventDate.start_time);
  const end = moment(eventDate.end_time);

  if (start.diff(end, "days") === 0) {
    result = `${start.format("DD.MM.YYYY HH:mm")} - ${end.format("HH:mm")}`;
  } else {
    result = `${start.format("DD.MM.YYYY HH:mm")} - ${end.format(
      "DD.MM.YYYY HH:mm"
    )}`;
  }
  return result;
};

const createEventLink = id => `https://www.facebook.com/events/${id}`;

const getEvents = () =>
  new Promise((resolve, reject) => {
    FB.api(
      `/${facebookPageId}/events`,
      "get",
      { time_filter: "upcoming" },
      res => {
        if (!res || res.error) {
          console.log(!res ? "error occurred" : res.error);
          reject(res);
        }

        const result = [];

        res.data.forEach(event => {
          const { id, name, description } = event;
          const nearestDate = extractNearestDate(event);
          const date = stringifyEventDate(nearestDate);
          const link = createEventLink(id);

          result.push({ name, nearestDate, date, link, description });
        });

        result.sort(
          (a, b) =>
            new Date(a.nearestDate.start_time) >
            new Date(b.nearestDate.start_time)
        );
        result.forEach(event => delete event.nearestDate);
        resolve(result);
      }
    );
  });

module.exports = {
  extractNearestDate,
  stringifyEventDate,
  createEventLink,
  getEvents
};
