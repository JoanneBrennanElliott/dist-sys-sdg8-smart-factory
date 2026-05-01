///client_browser.js unary client browser for GUI CheckMachineStatus

window.invokeUnary = async function () {
  const machineId = document.getElementById("machineIdInput").value;
  const output = document.getElementById("output");

  if (!machineId) {
    output.innerHTML = "<b>Error:</b> Machine ID is required.";
    return;
  }

  const res = await fetch("http://localhost:3000/checkMachineStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ machineId })
  });

  const data = await res.json();

  if (data.error) {
    output.innerHTML = `<b>Error:</b> ${data.error}`;
    return;
  }

  output.innerHTML = `
    <b>Machine ID:</b> ${data.machineId}<br>
    <b>Running:</b> ${data.isRunning}<br>
    <b>Status:</b> ${data.statusMessage}
  `;
};





//	window.invokeUnary = function () {
//	//	document.getElementById("output").innerHTML = "some text";
//	  const machineId = document.getElementById("machineIdInput").value;
//	  const output = document.getElementById("output");
//
//	  if (!machineId) {
//		output.innerHTML = "<b>Error:</b> Machine ID is required.";
//		return;
//	  }
//	output.innerHTML = `
//		<b>Machine ID:</b> ${machineId}<br>
//		<b>Status    :   Good</b>  `;
//		//<b>Running:</b> ${isRunning}<br>
//		//<b>Status:</b> ${statusMessage}
//	};

