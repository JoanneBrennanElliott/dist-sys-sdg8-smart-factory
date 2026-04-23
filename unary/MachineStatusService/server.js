//JBE unary server service CheckMachineStatus

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "/proto/unary.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
//console.log("grpcObj =", grpcObj);
const service = grpcObj.unary.MachineStatusService;

const server = new grpc.Server();
server.addService(service.service, { 
	CheckMachineStatus: checkMachineStatus 
	});

server.bindAsync(
	"0.0.0.0:40000", 
	grpc.ServerCredentials.createInsecure(), 
	function() {
		console.log("Server running on port 40000");
		//server.start();
	}
);
  
//Implement service methods (unary signature: (call, callback)) 
//function passing in a random machineID to Check Machine is operating

function checkMachineStatus(call, callback) { 
	const machineId = call.request.machineId;
	
	const isRunning = Math.random() > 0.3;
	const statusMessage = isRunning? "Machine operational"  : "Machine stopped";
	
	callback (null, {
		machineId,
		isRunning,
		statusMessage
	});
}

 


