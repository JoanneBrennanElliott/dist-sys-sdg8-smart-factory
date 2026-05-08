//bridge to connect GUI to gRPC

const express = require("express");
const cors = require("cors");     // need this cor package 
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(express.json());

app.use(cors());


// Load proto
const PROTO_PATH = __dirname + "/protos/unary.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const client = new grpcObj.unary.MachineStatusService(
  "localhost:40000",
  grpc.credentials.createInsecure()
);

//console.log("DIR:", __dirname);			//testing
//console.log("PROTO_PATH:", PROTO_PATH);

// HTTP endpoint the GUI will call
app.post("/checkMachineStatus", (req, res) => {
  const machineId = req.body.machineId;
  
  	 // added metadata
	const metadata = new grpc.Metadata();
	metadata.add("machine-id", "machine-01");
	metadata.add("trace-id", "web-ui-123");
	metadata.add("authorization", "Bearer TOKEN_123");
	

  client.CheckMachineStatus({ machineId },metadata, (err, response) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

// Start Express
app.listen(3000, () => {
  console.log("Bridge server running on http://localhost:3000");
});
