Bidirectional/AirQualityService/server/server.

  function MonitorAirQuality(call) {
  console.log("Client connected for Air Quality Monitoring");

  call.on("data", (req) => {
    const { sensorId, co2Level, timestamp } = req;
    let status, recommendation;

    if (co2Level < 800) {
      status = "GOOD";
      recommendation = "Air quality is safe.";
    } else if (co2Level < 1200) {
      status = "MODERATE";
      recommendation = "Increase ventilation slightly.";
    } else {
      status = "POOR";
      recommendation = "Activate ventilation system immediately!";
    }

    call.write({
      sensorID: sensorId,
      status,
      recommendation,
      timestamp: new Date().toISOString(),
    });
  });
