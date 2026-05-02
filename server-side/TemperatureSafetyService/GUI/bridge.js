//bridge to connect GUI to gRPC

const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(cors());
app.use(express.json());

// Load proto
const PROTO_PATH = __dirname + "/protos/temperature.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const client = new grpcObj.temperature.TemperatureSafetyService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// HTTP endpoint the GUI will call
app.post("/MonitorTemperatureStatus", (req, res) => {
  const { sensorId, threshold } = req.body;
  
	if (!sensorId || !threshold) {
		return res.status(400).json({ error: "Sensor ID and threshold required" });
	}

 const request = {
    sensorId: sensorId,
    threshold: Number(threshold)
  };
  
	client.MonitorTemperatureStatus( request , (err, response) => {
		if (err) {
		console.error("gRPC error:", err);
		return res.status(500).json({ error: "gRPC request failed" });
      //return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

// Start Express
app.listen(3000, () => {
  console.log("Bridge server running on http://localhost:3000");
});
