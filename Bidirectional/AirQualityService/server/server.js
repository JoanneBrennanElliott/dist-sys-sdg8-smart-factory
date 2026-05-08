//JBE AirQualityService
// definition of input message structure – sensorId is a string 
//and will identify which sensor to monitor, 
//and co2Level is a double that states the co2 Levels in parts per million (ppm)

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = __dirname + "/protos/airquality.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const service = grpcObj.airquality.AirQualityService;

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
server.addService(service.service, { MonitorAirQuality: MonitorAirQuality });

server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), () => {
    console.log("AirQualityService running on port 40000");
    //server.start();

    // Register with Naming Service -  // hostname from hosts file
    namingClient.Register(
      {name: "AirQualityService", address: "air-service:40000" },
      (err, res) => {
        if (err) {
          console.error("Registration failed:", err.message);
        } else {
          console.log(res.message);
        }
      }
    );
});//end register code 

function CurrentTimestamp() {
  const now = new Date();
  return now.toLocaleString("en-GB"); 
}

function MonitorAirQuality(call) {
  console.log("Client connected for Air Quality Monitoring");

	//Extract metadata
	const metadata = call.metadata.getMap();

	const token = metadata["authorization"];
	const traceId = metadata["trace-id"];
	const clientId = metadata["client-id"];
	console.log("Metadata received:", metadata);
	
	//Authentication check
	if (!token || token !== "Bearer TOKEN_123") {
		return callback({
		code: grpc.status.UNAUTHENTICATED,
		message: "Invalid or missing authentication token"
		});
	}

  call.on("data", (req) => {
	  
	// Check for Valid inputs 
    if (!isValidReading(req)) {
      console.warn("Invalid reading received:", req);

      call.write({
        sensorID: req.sensorId || "UNKNOWN",
        status: "INVALID",
        recommendation: "Reading rejected due to invalid or missing fields.",
        timestamp: CurrentTimestamp(),
      });

      return; // skip processing
    }
	
    const { sensorId, co2Level, timestamp } = req;
	
    let status = "";
	let recommendation = "";
	const co2 = Number(req.co2Level);
	

// 1. Extreme danger
    if (co2 > 5000) {
      status = "DANGEROUS";
      recommendation = "Evacuate area immediately. CO₂ at hazardous levels.";
    }
    else if (co2 > 2000) {
      status = "VERY POOR";
      recommendation = "Ventilation required urgently. Air quality unsafe.";
    }
    else if (co2 > 1200) {
      status = "POOR";
      recommendation = "Activate ventilation system immediately.";
    }
    else if (co2 > 800) {
      status = "MODERATE";
      recommendation = "Increase ventilation slightly.";
    }
    else {
      status = "GOOD";
      recommendation = "Air quality is safe.";
    }
	
	// Colour-coded console output
	if (co2 > 5000) {
	  console.log(`\x1b[31m[DANGEROUS] Sensor ${sensorId} | CO₂: ${co2}\x1b[0m`);
	}
	
    call.write({
      sensorID: sensorId,
      status,
      recommendation,
	  timestamp : CurrentTimestamp(),
    });
  });

  call.on("end", () => {
    console.log("Client stream ended.");
    call.end();
  });

  call.on("error", (err) => {
    console.error("Error in stream:", err.message);
  });
}


//Validation - Check for Valid inputs 
function isValidReading(r) {
 
 if (!r.sensorId || typeof r.sensorId !== "string") return false;
 
 const co2 = Number(r.co2Level);
  if (isNaN(co2)) return false;
  if (co2 < 0 || co2 > 10000) return false;
  // if (!r.timestamp || isNaN(Date.parse(r.timestamp))) return false;
  return true;
}

function main() {
  const server = new grpc.Server();
  server.addService(service.service, { MonitorAirQuality });
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    console.log("AirQualityService running on port 50051");
   // server.start();
  });
}

//main();

