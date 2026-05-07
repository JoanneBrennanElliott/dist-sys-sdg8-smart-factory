//JBE client service TEMPERATURESAFETYSERVICE

// client.js
// updated windows hosts file to use of service name temperature-service
// instead of hardcoding IP address.

var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

const path = require("path");
const PROTO_PATH = path.join(
  __dirname,
  "../server/protos/temperature.proto"
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
const service = grpcObj.temperature.TemperatureSafetyService;

//updating to add the Discovery Step to get the address from the naming service
//var client = new service(
//	//"0.0.0.0:40000", 
//	"temperature-service:40000",	//naming service			
//	grpc.credentials.createInsecure()
//	);

// Load naming.proto
//const path = require("path");
const NAMING_PROTO_PATH = path.join(__dirname, "../server/protos/protos/naming.proto");

console.log("DIR:", __dirname);
console.log("PROTO_PATH:", PROTO_PATH);
console.log("NAMING PATH:", NAMING_PROTO_PATH);

const namingDef = protoLoader.loadSync(NAMING_PROTO_PATH, {});
const namingObj = grpc.loadPackageDefinition(namingDef);
const namingService = namingObj.naming.NamingService;

// Create NamingService client
const namingClient = new namingService(
  "localhost:5000", //  naming service port
  grpc.credentials.createInsecure()
);

// Discover TemperatureSafetyService dynamically
namingClient.Discover({ name: "TemperatureSafetyService" }, (err, res) => {
  if (err) {
    console.error("Discovery failed:", err.message);
    return;
  }

  const discoveredAddress = res.address;
  console.log(`Discovered TemperatureSafetyService at ${discoveredAddress}`);

  // Create TemperatureSafetyService client using discovered address
  const client = new service(
    discoveredAddress,
    grpc.credentials.createInsecure()
  );

	
const colors = {red: "\x1b[31m", reset: "\x1b[0m"};

// Deadline timeout set in seconds
function getDeadline(seconds) {
  const d = new Date();
  d.setSeconds(d.getSeconds() + seconds);
  return d;
}

//added metadata
const metadata = new grpc.Metadata();
metadata.add("client-id", "dashboard-01");
metadata.add("trace-id", "stream-" + Date.now());
metadata.add("authorization", "Bearer TOKEN_123");

//make temperature request passing in its correstponding max threshold
const request = { sensorId: "AC-GroundFloor",threshold: 25.0 };

const stream = client.MonitorTemperatureStatus (request, metadata,
	{ deadline: getDeadline(30) } // 30‑second timeout
);

//start streaming with added timeout

stream.on("data", (res) => {
  const isHigh =
    res.statusMessage.includes("CRITICAL") ||
    res.statusMessage.includes("WARNING");

  const line = `[${res.timestamp}] Sensor ${res.sensorId} | Temp: ${res.temperature.toFixed(2)}°C | Status: ${res.statusMessage}`;

  if (isHigh) {
    console.log(colors.red + line + colors.reset);
  } else {
    console.log(line);
  }
});

// --- Handle remote invocation errors ---
stream.on("error", (err) => {
  console.error("Remote Invocation Error");

  switch (err.code) {
    case grpc.status.INVALID_ARGUMENT:
      console.error("Invalid request sent to server:", err.message);
      break;

    case grpc.status.UNAVAILABLE:
      console.error("TemperatureSafetyService unavailable — server offline or network issue");
      break;

    case grpc.status.DEADLINE_EXCEEDED:
      console.error("Request timed out — server took too long to respond");
      break;

    case grpc.status.INTERNAL:
      console.error("Server internal error:", err.message);
      break;

    case grpc.status.CANCELLED:
      console.error("Stream cancelled by client");
      break;

    default:
      console.error("Unknown error:", err.message);
  }
});
	
stream.on("end", () => {
  console.log("Client Side Monitoring Completed.");
});

});
