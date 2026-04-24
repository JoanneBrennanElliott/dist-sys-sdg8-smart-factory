//JBE 24/04/26 server side service TemperatureSafetyService

//server will stream the temperature response, back to the client.

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "/protos/temperature.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
//console.log("grpcObj =", grpcObj);
const service = grpcObj.temperature.TemperatureSafetyService;

const server = new grpc.Server();
server.addService(service.service, { 
	MonitorTemperatureStatus: MonitorTemperatureStatus 
	});

server.bindAsync(
	"0.0.0.0:40000", 
	grpc.ServerCredentials.createInsecure(), 
	function() {
		console.log("Server running on port 40000");
		//server.start();
	}
);
  
//Implement service methods (temperature signature: (call)) 
//function passing in a sensorId and its maximum threshold temperature
// to Check sensor on a machine is operating within the correct threshold
// the client will return a response with a timestamp, its corresponding sensorId,
// its current temperature and a status message stating info about it
// eg too high , must reduce or operating fine.
// it will display in the log in red font if it is critical overheating message
// Basic validation added

// randomly generate temperature
function generateTemperature() {
  return 18 + Math.random() * 15; // 18–33°C
}

function CurrentTimestamp() {
  const now = new Date();
  return now.toLocaleString("en-GB"); 
}

function MonitorTemperatureStatus(call) { 
	const {sensorId, threshold } = call.request;
	
	// Basic validation
    if (!sensorId || typeof threshold !== "number") {
      return call.emit("error", {
        code: grpc.status.INVALID_ARGUMENT,
        message: "sensorId (string) and threshold (number) are required"
      });
    }
	
	console.log(`Monitoring sensor ${sensorId} with threshold ${threshold}`);
	
	let count = 0;
	const interval = setInterval(() => {
		const temperature = generateTemperature();
		//const now = new Date().toISOString();
		const timestamp = CurrentTimestamp();
		
		let status = "";
		if (temperature > threshold + 5) {
		  status = "CRITICAL: Temperature far above safe threshold. Immediate action required.";
		} else if (temperature > threshold) {
		  status = "WARNING: Temperature above threshold. Reduce load or cool system.";
		} else if (temperature >= threshold - 3) {
		  status = "OK: Operating within acceptable bandwidth.";
		} else {
		  status = "Stable: Temperature well below threshold.";
		}


		call.write ( {sensorId, temperature: temperature, statusMessage: status, timestamp});

		count++;
		if (count === 10) {
		  clearInterval(interval);
		  call.end();
		}
	}, 1000);
  
  // Handle client disconnect
    call.on("cancelled", () => {
      console.log(`Client cancelled monitoring for ${sensorId}`);
      clearInterval(interval);
    });
  
}
 


