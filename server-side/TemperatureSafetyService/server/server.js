//JBE 24/04/26 server side service TemperatureSafetyService

//server will stream the temperature response, back to the client.

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "/protos/temperature.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
//console.log("grpcObj =", grpcObj);
const service = grpcObj.temperature.TemperatureSafetyService;

//loads my NamingService definitions.
const path = require("path");
const namingProtoPath = path.join(__dirname, "/protos/protos/naming.proto");

const namingPackageDef = protoLoader.loadSync(namingProtoPath);
const namingGrpcObj = grpc.loadPackageDefinition(namingPackageDef);
const naming = namingGrpcObj.naming;

const namingClient = new naming.NamingService(
  "localhost:5000",
  grpc.credentials.createInsecure()
);


const server = new grpc.Server();
server.addService(service.service, { 
	MonitorTemperatureStatus: MonitorTemperatureStatus 
	});

//server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), () => {
    console.log("TemperatureSafetyService running on port 40000");
  //  console.log("TemperatureSafetyService running on port 50051");
    //server.start();

    // Register with Naming Service -  // hostname from hosts file
    namingClient.Register(
      {name: "TemperatureSafetyService", address: "temperature-service:40000" },
      (err, res) => {
        if (err) {
          console.error("Registration failed:", err.message);
        } else {
          console.log(res.message);
        }
      }
    );
});

  
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

	console.log("Client connected to MonitorTemperatureStatus");
	
	//Extract metadata
	const metadata = call.metadata.getMap();

	const token = metadata["authorization"];
	const traceId = metadata["trace-id"];
	const clientId = metadata["client-id"];
	console.log("Metadata received:", metadata);


  //Authentication check
  if (!token || token !== "Bearer TOKEN_123") {
    call.destroy({
      code: grpc.status.UNAUTHENTICATED,
      message: "Invalid or missing authentication token"
    });
    return;
  }	
	const {sensorId, threshold } = call.request;
	
	// validation of incoming request
	if (!sensorId || typeof sensorId !== "string") {
		return call.emit("error", {
			code: grpc.status.INVALID_ARGUMENT,
			message: "sensorId must be a non-empty string"
		});
	}

	if (typeof threshold !== "number" || threshold <= 0) {
		return call.emit("error", {
			code: grpc.status.INVALID_ARGUMENT,
			message: "threshold must be a positive number"
		});
	}
	
	console.log(`Monitoring sensor ${sensorId} with threshold ${threshold}`);
	
	let count = 0;
	const interval = setInterval(() => {
		
	try {
      // Simulate internal server error
      if (Math.random() < 0.05) {
        throw new Error("Temperature sensor read failure");
      }
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
		} catch (err) {
		  clearInterval(interval);
		  console.error("Internal error:", err.message);

		  call.emit("error", {
			code: grpc.status.INTERNAL,
			message: "Internal sensor processing error"
		  });
		}
	}, 1000);
  
  // Handle client disconnect
    call.on("cancelled", () => {
      console.log(`Client ended monitoring for ${sensorId}`);
      clearInterval(interval);
    });
	
}
 


