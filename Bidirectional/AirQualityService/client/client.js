
// definition of output message structure – 
//sensorId string as same request, 
//status is defined as a string e.g. “good”, “poor”, “moderate” 
//and recommendation is a string stating some useful information
// e.g. “air quality is poor, increase ventilation” and timestamp for user info.

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = __dirname + "/protos/airquality.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const service = grpcObj.airquality.AirQualityService;

//const client = new service("localhost:50051", grpc.credentials.createInsecure());
//add the Discovery Step
// Load naming.proto
const path = require("path");
const NAMING_PROTO_PATH = path.join(__dirname, "/protos/protos/naming.proto");
const namingDef = protoLoader.loadSync(NAMING_PROTO_PATH, {});
const namingObj = grpc.loadPackageDefinition(namingDef);
const namingService = namingObj.naming.NamingService;

// Create NamingService client
const namingClient = new namingService(
  "localhost:5000", //  naming service port
  grpc.credentials.createInsecure()
);

// Discover AirQualityService dynamically
namingClient.Discover({ name: "AirQualityService" }, (err, res) => {
  if (err) {
    console.error("Discovery failed:", err.message);
    return;
  }

  const discoveredAddress = res.address;
  console.log(`Discovered AirQualityService at ${discoveredAddress}`);

  // Create AirQualityService client using discovered address
  const client = new service(
    discoveredAddress,
    grpc.credentials.createInsecure()
  );
//end discovery code

//added metadata
const metadata = new grpc.Metadata();
metadata.add("client-id", "dashboard-01");
metadata.add("trace-id", "bi-stream-" + Date.now());
metadata.add("authorization", "Bearer TOKEN_123");

const stream = client.MonitorAirQuality(metadata,
	{ deadline: getDeadline(30) }
));

const readings = [
  { sensorId: "CO2-01", co2Level:088 },
  { sensorId: "CO2-02", co2Level: 950.0 },
  { sensorId: "CO2-03", co2Level: 6400 },
  { sensorId: "Floor2CO2-001", co2Level: 400 },
  { sensorId: "BasementCO2-01", co2Level: 6600 },
  { sensorId: "Floor3CO2", co2Level: 300 },
];

function CurrentTimestamp() {
  const now = new Date();
  return now.toLocaleString("en-GB"); 
}
const timestamp = CurrentTimestamp();


readings.forEach((r) => {
  stream.write({ 
	sensorId: r.sensorId,
	co2Level: r.co2Level,
	timestamp:timestamp 
	});
});

const colors = {red: "\x1b[31m", reset: "\x1b[0m"};

stream.on("data", (res) => {
	
	const isHigh = res.status.includes("DANGEROUS");
 
	const line =  
		`[${res.timestamp}] | Sensor ${res.sensorID} | Status: ${res.status} | Recommendation: ${res.recommendation}`;

	if (isHigh) {
		console.log(colors.red + line + colors.reset);
	} else {
		console.log(line);
	}
});

stream.on("end", () => {
  console.log("Monitoring completed.");
});

stream.on("error", (err) => {
  console.error("Error:", err.message);
});

setTimeout(() => {
  console.log("Cancelling stream from client...");
  stream.cancel();
}, 10000)
});
