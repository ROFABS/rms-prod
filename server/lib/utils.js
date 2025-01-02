const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isBetween = require("dayjs/plugin/isBetween"); // Import isBetween plugin

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const TIMEZONE = "Asia/Kolkata";

module.exports = {
  calculateTimeDuration: (
    startTime,
    endTime,
    date,
    userTimezone = TIMEZONE
  ) => {
    const now = date ? dayjs(date).tz(userTimezone) : dayjs().tz(userTimezone); // Current date and time in user's timezone
    const todayDate = now.format("YYYY-MM-DD"); // Today's date in user's timezone
    const tomorrowDate = now.add(1, "day").format("YYYY-MM-DD"); // Tomorrow's date in user's timezone

    // Parse start and end times for today and tomorrow
    let startDateTime = dayjs.tz(
      `${todayDate} ${startTime}`,
      "YYYY-MM-DD hh:mm A",
      userTimezone
    );
    let endDateTime = dayjs.tz(
      `${todayDate} ${endTime}`,
      "YYYY-MM-DD hh:mm A",
      userTimezone
    );

    // Adjust end time if it extends to early hours of the next day
    if (endDateTime.isBefore(startDateTime)) {
      endDateTime = dayjs.tz(
        `${tomorrowDate} ${endTime}`,
        "YYYY-MM-DD hh:mm A",
        userTimezone
      );
    }

    // Determine if we should use today or tomorrow based on the current time
    if (now.isAfter(endDateTime)) {
      // If the current time is past the closing time (e.g., after 2 AM), use tomorrow's start time
      startDateTime = dayjs.tz(
        `${tomorrowDate} ${startTime}`,
        "YYYY-MM-DD hh:mm A",
        userTimezone
      );
      endDateTime = dayjs
        .tz(`${tomorrowDate} ${endTime}`, "YYYY-MM-DD hh:mm A", userTimezone)
        .add(1, "day");
    }

    // Convert to UTC timestamps in milliseconds
    const startTimestamp = startDateTime.utc().valueOf(); // UTC timestamp in milliseconds
    const endTimestamp = endDateTime.utc().valueOf(); // UTC timestamp in milliseconds

    // Calculate the duration in hours
    const duration = endDateTime.diff(startDateTime, "hour", true);

    return {
      startTimestamp, // Milliseconds format for database compatibility
      endTimestamp, // Milliseconds format for database compatibility
      duration,
    };
  },
};
