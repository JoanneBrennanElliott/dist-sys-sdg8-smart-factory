
//JBE unary client service CheckMachineStatus

// client.js
// updated windows hosts file to use of service name machine-service
// instead of hardcoding IP address.

var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/unary.proto"

const path = require("path");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
const service = grpcObj.unary.MachineStatusService;

//Adding Naming Service
//var client = new service(
//	//"0.0.0.0:40000", 
//	"machine-service:40000",
//	grpc.credentials.createInsecure()
//	);

// Load naming.proto
const NAMING_PROTO_PATH = path.join(__dirname, "protos/naming.proto");
const namingDef = protoLoader.loadSync(NAMING_PROTO_PATH, {});
const namingObj = grpc.loadPackageDefinition(namingDef);
const namingClient = new namingObj.naming.NamingService(
  "localhost:5000", // Naming Service port
  grpc.credentials.createInsecure()
);

// Discover MachineStatusService dynamically
namingClient.Discover({ name: "MachineStatusService" }, (err, res) => {
  if (err) {
    console.error("Discovery failed:", err.message);
    return;
  }
    const serviceAddress = res.address;
  console.log(`Discovered MachineStatusService at ${serviceAddress}`);

  // Create client using discovered address
  const client = new service(
    serviceAddress,
    grpc.credentials.createInsecure()
  );
  
// test
//console.log("client.js loaded");
	 
	 // Create metadata
	const metadata = new grpc.Metadata();
	metadata.add("machine-id", "machine-01");
	metadata.add("trace-id", "req-" + Date.now());
	metadata.add("authorization", "Bearer TOKEN_123");
	
	
		//make unary request
		client.CheckMachineStatus (
			{ machineId : "machine-01"},  
			metadata,
			(err, response) => {
				if (err){
					console.error("Remote Invocation Error");
					switch (err.code) {
					case grpc.status.INVALID_ARGUMENT:
						console.error("Invalid request:", err.message);
						break;
					case grpc.status.UNAVAILABLE:
					  console.error("Service unavailable — server offline or network issue");
						break;
					case grpc.status.DEADLINE_EXCEEDED:
						console.error("Request timed out — server took too long to respond");
						break;
					case grpc.status.INTERNAL:
						console.error("Server internal error:", err.message);
					break;
					default:
					  console.error("Unknown error:", err.message);
				  }				  
				}
			else {
			console.log("Response:");
			console.log("Machine: ", response.machineId);
			console.log("Running: ", response.isRunning);
			console.log("Status : ", response.statusMessage);
			}
				});
});

