const stream = client.MonitorAirQuality();

const readings = [
  { sensorId: "CO2-01", co2Level: 700 },
  { sensorId: "CO2-02", co2Level: 950 },
  { sensorId: "CO2-03", co2Level: 1300 },
];

readings.forEach((r) => {
  stream.write({ ...r, timestamp: new Date().toISOString() });
});

stream.on("data", (res) => {
  console.log(
    `Sensor ${res.sensorID} | Status: ${res.status} | Recommendation: ${res.recommendation}`
  );
});

stream.on("end", () => {
  console.log("Monitoring completed.");
});

