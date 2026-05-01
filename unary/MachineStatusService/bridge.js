//bridge to connect GUI to gRPC

const express = require("express");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(express.json());

// Load proto
const PROTO_PATH = __dirname + "/protos/unary.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const client = new grpcObj.unary.MachineStatusService(
  "localhost:40000",
  grpc.credentials.createInsecure()
);

// HTTP endpoint the GUI will call
app.post("/checkMachineStatus", (req, res) => {
  const machineId = req.body.machineId;

  client.CheckMachineStatus({ machineId }, (err, response) => {
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
