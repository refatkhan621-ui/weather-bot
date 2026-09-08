const admin = require("firebase-admin");
const axios = require("axios");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const DISTRICT_NAME = "Dhaka"; 

async function checkWeatherAndNotify() {
  try {
    const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${DISTRICT_NAME}&count=1&language=en&format=json`);
    if (!geoRes.data.results) return;
    
    const { latitude, longitude } = geoRes.data.results[0];

    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`);
    const currentTemp = Math.round(weatherRes.data.current.temperature_2m);

    console.log(`Current Temp in ${DISTRICT_NAME}: ${currentTemp}°C`);

    const message = {
      notification: {
        title: `আবহাওয়া আপডেট: ${DISTRICT_NAME}`,
        body: `বর্তমান তাপমাত্রা ${currentTemp}°C।`
      },
      topic: "weather_updates"
    };

    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

checkWeatherAndNotify();
