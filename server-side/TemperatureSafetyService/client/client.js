//JBE client service TEMPERATURESAFETYSERVICE

// client.js

var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/temperature.proto"


const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
const service = grpcObj.temperature.TemperatureSafetyService;

var client = new service(
	"0.0.0.0:40000", 
	grpc.credentials.createInsecure()
	);
	
const colors = {
  red: "\x1b[31m",
  reset: "\x1b[0m"
};

//make temperature request passing in its correstponding max threshold
const request = { sensorId: "AC-GroundFloor",threshold: 25.0 };
const stream = client.MonitorTemperatureStatus (request);

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
	
//stream.on("data", (res) => {
 // console.log(
  //  `[${res.timestamp}] Sensor ${res.sensorId} | Temp: ${res.temperature.toFixed(2)}°C | Status: ${res.statusMessage}`
  //);
//});

stream.on("end", () => {
  console.log("Monitoring completed.");
});
