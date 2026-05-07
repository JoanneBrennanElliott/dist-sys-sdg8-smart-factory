///client_browser.js client browser for GUI 

window.invokeClientServer = async function () {
	// for testing purposes 
	//console.log("invokeClientServer() started");
	document.getElementById("output").innerHTML = "Button clicked..waiting for response....";


 const sensorId = document.getElementById("sensorIdInput").value;
 //const threshold = document.getElementById("thresholdInput").value.trim();
   const threshold = Number(document.getElementById("thresholdInput").value.trim());
   const output = document.getElementById("output");
 
//console.log("Sensor:", sensorId, "Threshold:", threshold);
//console.log("Sending fetch request...");

  if (!sensorId) {
    output.innerHTML = "<b>Error:</b> A Sensor ID is required.";
    return;
  }  
  if (!threshold) {
    output.innerHTML = "<b>Error:</b> Threshold are required.";
    return;
  }
  
    let data;   // declare here so it's visible after try/catch

    try {
    const response = await fetch("http://localhost:3000/MonitorTemperatureStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
 	 //   body: JSON.stringify({ sensorId, threshold })
  	  body: JSON.stringify({ sensorId, threshold: Number(threshold) })
	  });
		
	//console.log("Fetch completed. Response status:", response.status);    // for testing purposes 

	data = await response.json();
	//console.log("Received data:", data);    // for testing purposes 
	
	}catch (err) {
		console.error("Fetch error:", err);
		output.innerHTML = "<b>Fetch error:</b> " + err.message;
		 return;
	}

	if (!data.stream || data.stream.length === 0) {
	  output.innerHTML = "<b>No data received from server.</b>";
	  return;
	}

	let html = `
	  <b>Sensor:</b> ${sensorId}<br>
	  <b>Threshold:</b> ${threshold}°C<br><br>
	  <b>Streamed Response:</b><br>
	`;

	output.innerHTML = "";   // clears the waiting message

	data.stream.forEach((item, index) => {
	  //html += `Update ${index + 1}: ${JSON.stringify(item)}<br>`;

		// Decide colour based on status if Status: CRITICAL display red
		let statusColor = "black";
		if (item.statusMessage.toUpperCase().includes("CRITICAL")) {
			statusColor = "red";
		}
	 

	  	output.innerHTML += `
			<div class="update-card">
			<div class="update-title">Update ${index + 1}</div>
			<div class="update-field"><b>Sensor:</b> ${item.sensorId}</div>
			<div class="update-field"><b>Temperature:</b> ${item.temperature.toFixed(2)}°C</div>
			<div class="update-field" style="color:${statusColor}">
				<b>Status:</b> ${item.statusMessage}
			</div>
			<div class="update-field"><b>Time:</b> ${item.timestamp}</div>
			</div>
		`;
	});
};
