
//JBE unary client service CheckMachineStatus

// client.js

var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/proto/unary.proto"


const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
const service = grpcObj.unary.MachineStatusService;


var client = new service(
	"0.0.0.0:40000", 
	grpc.credentials.createInsecure()
	);

//make unary request
client.CheckMachineStatus (
	{ machineId : "machine-01"},
		(err, response) => {
			if (err){
				console.error("Error:",err);
				return;
				}
	
		console.log("Response:");
		console.log("Machine: ", response.machineId);
		console.log("Running: ", response.isRunning);
		console.log("Status : ", response.statusMessage);
	}
);