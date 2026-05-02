///client_browser.js client browser for GUI 

window.invokeClientServer = async function () {
  const sensorId = document.getElementById("sensorIdInput").value;
 const threshold = document.getElementById("thresholdInput").value.trim();
 const output = document.getElementById("output");

  if (!sensorId) {
    output.innerHTML = "<b>Error:</b> A Sensor ID is required.";
    return;
  }  
  if (!threshold) {
    output.innerHTML = "<b>Error:</b> Threshold are required.";
    return;
  }

    try {
    const response = await fetch("http://localhost:3000/MonitorTemperatureStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sensorId, threshold })
    });

    const data = await response.json();

    output.innerHTML = `
      <b>Sensor:</b> ${sensorId}<br>
      <b>Threshold:</b> ${threshold}°C<br><br>
      <b>gRPC Response:</b><br>
      ${JSON.stringify(data)}
    `;
  } catch (err) {
    output.innerHTML = "<b>Error:</b> Could not reach bridge server.";
  }
};
