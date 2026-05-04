//JBE unary server service CheckMachineStatus

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const PROTO_PATH = __dirname + "/protos/unary.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
//console.log("grpcObj =", grpcObj);
const service = grpcObj.unary.MachineStatusService;

const server = new grpc.Server();
server.addService(service.service, { 
	CheckMachineStatus: checkMachineStatus 
	});

// Load naming.proto and create NamingService client
const NAMING_PROTO_PATH = path.join(__dirname, "protos/naming.proto");
const namingDef = protoLoader.loadSync(NAMING_PROTO_PATH, {});
const namingObj = grpc.loadPackageDefinition(namingDef);
const namingClient = new namingObj.naming.NamingService(
  "localhost:5000", // Naming Service port
  grpc.credentials.createInsecure()
);

// Bind and register with Naming Service
server.bindAsync(
  "0.0.0.0:40000",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("MachineStatusService running on port 40000");
	    // Register with Naming Service
    namingClient.Register(
      { name: "MachineStatusService", address: "machine-service:40000" },
      (err, res) => {
        if (err) {
          console.error("Registration failed:", err.message);
        } else {
          console.log(res.message);
        }
      }
    );

    //server.start();
  }
);
  
//Implement service methods (unary signature: (call, callback)) 
//function passing in a random machineID to Check Machine is operating

function checkMachineStatus(call, callback) { 
	
	// Extract metadata
	  const metadata = call.metadata.getMap();
	  const token = metadata["authorization"];
	  const traceId = metadata["trace-id"];
	  const metaMachineId = metadata["machine-id"];

	  console.log("Metadata received:", metadata);
  
	//Authentication check
	if (!token || token !== "Bearer TOKEN_123") {
		return callback({
		code: grpc.status.UNAUTHENTICATED,
		message: "Invalid or missing authentication token"
		});
	}
	
	const machineId = call.request.machineId;
	
	// Input validation
    if (!machineId || typeof machineId !== "string") {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "machineId is required and must be a string"
      });
    }
	
	const isRunning = Math.random() > 0.3;
	const statusMessage = isRunning? "Machine operational"  : "Machine stopped";
	
	callback (null, {
		machineId,
		isRunning,
		statusMessage
	});
}

 


