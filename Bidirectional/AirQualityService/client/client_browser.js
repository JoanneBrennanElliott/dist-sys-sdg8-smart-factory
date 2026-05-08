///new client_browser.js client browser for GUI for bi-direct system

window.invokeClientServer = async function () {
	// for testing purposes 
	//console.log("invokeClientServer() started");
	document.getElementById("output").innerHTML = "Button clicked..waiting for response....";


  const readings = [
    { sensorId: "CO2-01", co2Level:88 },
    { sensorId: "CO2-02", co2Level: 950.0 },
    { sensorId: "CO2-03", co2Level: 6400 },
    { sensorId: "Floor2CO2-001", co2Level: 400 },
    { sensorId: "BasementCO2-01", co2Level: 6600 },
    { sensorId: "Floor3CO2", co2Level: 300 },
  ];


	//const output = document.getElementById("output");
 
	//console.log("Sensor:", sensorId, "co2Level:", co2Level);
	console.log("Sending fetch request...");

  controller = new AbortController();

    try {
     // for (const r of readings) {
          const response = await fetch("http://localhost:3000/MonitorAirQuality", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({readings})
        });
		
      //console.log("Fetch completed. Response status:", response.status);    // for testing purposes 

      const data = await response.json();
      //console.log("Received data:", data);    // for testing purposes 
      

      if (!data.stream || data.stream.length === 0) {
        output.innerHTML = "<b>No data received .</b>";
        return;
      }

      output.innerHTML = "";   // clears the waiting message
      
      output.innerHTML += "\nReceiving updates...\n\n";

        data.stream.forEach((item, index) => {

           let cssClass = "status-good";

          if (item.status === "GOOD") cssClass = "status-good";
          if (item.status === "DANGEROUS") cssClass = "status-danger";

          output.innerHTML += `
            <div>
              <b>Update ${index + 1}</b><br>
              Sensor: <b>${item.sensorId}</b><br>
              Status: <span class="${cssClass}">${item.status}</span><br>
              Recommendation: ${item.recommendation}<br>
              Timestamp: ${item.timestamp}<br><br>
            </div>
          `;     
        });
		
	  }catch (err) {
		//console.error("Fetch error:", err);
        if (err.name === "AbortError") {
            output.innerHTML += "\nStream stopped.";
        } else {
            output.innerHTML += "\nError: " + err.message;
        }
	  }
};

	let controller = null;

	function startStream() {    //Sends request to bridge
		window.invokeClientServer();
	}

	function stopStream() {
		if (controller) controller.abort();
	}