///client_browser.js unary client browser for GUI CheckMachineStatus

window.invokeUnary = async function () {
  const machineId = document.getElementById("machineIdInput").value;
  const output = document.getElementById("output");

  if (!machineId) {
    output.innerHTML = "<b>Error:</b> Machine ID is required.";
    return;
  }

   let data;  

    try {
    const response = await fetch("http://localhost:3000/checkMachineStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
 	 body: JSON.stringify({ machineId })
	  });
		
	console.log("Fetch completed. Response status:", response.status);    // for testing purposes 

	const data = await response.json();
	console.log("Received data:", data);    // for testing purposes 
	
	if (!data || data.error	=== 0) {
	  output.innerHTML = "<b>No data received from server.</b>";
	  return;
	}

  output.innerHTML = `
    <b>Machine ID:</b> ${data.machineId}<br>
    <b>Running:</b> ${data.isRunning}<br>
    <b>Status:</b> ${data.statusMessage}
  `;
  
  }catch (err) {
		console.error("Fetch error:", err);
		output.innerHTML = "<b> Error conacting server</b> " + err.message;
		 return;
	}
};
