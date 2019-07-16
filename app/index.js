import clock from "clock";
import document from "document";
import {me} from "appbit";
import {battery} from "power";
import {today} from "user-activity";
import {BodyPresenceSensor} from "body-presence";
import {preferences} from "user-settings";
import * as util from "../common/utils";
import {HeartRateSensor} from "heart-rate";

// Update the clock every minute
clock.granularity = "minutes";

let batFillWidth = 18;

// Get a handle on the <text> element
const myTime = document.getElementById("time");
const date = document.getElementById("date");
const flagImage = document.getElementById("flagImage");
const hrElement = document.getElementById("heartRateValue");
const stepsElement = document.getElementById("stepCountValue");
const calorieElement = document.getElementById("calorieCountValue");
const distanceElement = document.getElementById("distanceCountValue");
const batteryLvlElement = document.getElementById("batteryLevel");
const batteryFillElement = document.getElementById("batteryFill");

const body = new BodyPresenceSensor();
const hrm = new HeartRateSensor();

if (me.permissions.granted("access_heart_rate")) {
    hrm = new HeartRateSensor({frequency: 3});
    hrm.onreading = () => {
        hrElement.text = `${hrm.heartRate} bpm`;
        hrm.timestamp
    };
}

if (me.permissions.granted("access_activity")) {
    body = new BodyPresenceSensor();
    body.onreading = () => {
        if (!body.present) {
            hrm.stop();
            hrElement.text = "-";
            return;
        }
        hrm.start();
    };
    body.start();
}

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let myToday = evt.date;
  let hours = myToday.getHours();
  let ampm = " AM"
  
  if (preferences.clockDisplay === "12h") {
    // 12h format
    if (hours > 12){
      ampm = " PM";
      hours = hours % 12 || 12;
    } else if (hours == 12){
      ampm = " PM"
    } else if (hours == 0 && ampm == " AM") {
      hours += 12;
    }
  } else {
    // 24h format
    hours = util.zeroPad(hours);
    ampm = "";
  }
  let mins = util.zeroPad(myToday.getMinutes());
  
  let day = myToday.getDate();
  let month = myToday.getMonth() + 1;
  let year = myToday.getFullYear();
  
  let timeString = `${hours}:${mins}${ampm}`;
  
  myTime.text = timeString;
  
  date.text = `${day}/${month}/${year}`;
  
  stepsElement.text = today.adjusted.steps ? `${today.adjusted.steps}` : "-";
  calorieElement.text = today.adjusted.calories ? `${today.adjusted.calories} cals` : "-";
  distanceElement.text = today.adjusted.distance ? `${today.adjusted.distance} m` : "-";
  
  let level = battery.chargeLevel;
  batteryLvlElement.text = `${Math.floor(level)}%`;
  batteryFillElement.width = Math.floor(batFillWidth * level / 100.);
}
