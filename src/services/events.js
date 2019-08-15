/* eslint camelcase: "off" */

const fb = require("fb");
const showdown = require("showdown");
const {
  extractNearestDate,
  stringifyEventDate,
  createEventLink,
  addCalendarIcon
} = require("../utilities/facebook");

const converter = new showdown.Converter({
  simplifiedAutoLink: true
});

const options = {
  version: "v3.3",
  accessToken: process.env.FB_TOKEN
};

const getEventImage = id => {
  const FB = new fb.Facebook(options);

  return new Promise((resolve, reject) => {
    FB.api(`/${id}?fields=cover`, res => {
      if (!res || res.error) {
        reject(res);
      }
      resolve(res.cover.source);
    });
  });
};

const getEvents = () => {
  const FB = new fb.Facebook(options);

  return new Promise((resolve, reject) => {
    FB.api(
      `/${
        process.env.FB_PAGE_ID
      }/events?fields=cover,description,end_time,id,name,start_time,event_times`,
      "get",
      {
        time_filter: "upcoming"
      },
      res => {
        if (!res || res.error) {
          reject(res);
        }

        const result = [];
        if (res.data) {
          res.data.forEach(event => {
            const { cover, description, id, name } = event;
            const nearestDate = extractNearestDate(event);
            const date = stringifyEventDate(nearestDate);
            const link = createEventLink(nearestDate.id);
            const htmlDescription = converter.makeHtml(description);
            const { dayicon, tag } = addCalendarIcon({ link, date });

            result.push({
              cover,
              date,
              description,
              htmlDescription,
              id,
              link,
              name,
              nearestDate,
              tag,
              dayicon
            });
          });

          result.sort(
            (a, b) =>
              new Date(a.nearestDate.start_time) -
              new Date(b.nearestDate.start_time)
          );
        }

        resolve(result);
      }
    );
  });
};

module.exports = {
  getEvents,
  getEventImage
};
