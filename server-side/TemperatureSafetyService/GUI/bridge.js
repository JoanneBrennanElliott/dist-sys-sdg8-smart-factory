//bridge to connect GUI to gRPC

const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(cors());
app.use(express.json());

// Load proto
//const PROTO_PATH = __dirname + "/protos/temperature.proto";
//const packageDef = protoLoader.loadSync(PROTO_PATH, {});

const path = require("path");
const PROTO_PATH = path.join(
  __dirname,
  "../server/protos/temperature.proto"
);
//const PROTO_PATH = "C:/DSCA/ServerSide/TemperatureSafetyService/server/protos/temperature.proto";

console.log("DIR:", __dirname);
console.log("PROTO_PATH:", PROTO_PATH);

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const grpcObj = grpc.loadPackageDefinition(packageDef);
//console.log("Loaded gRPC object:", grpcObj);    // for testing purposes 

const client = new grpcObj.temperature.TemperatureSafetyService(
//  "localhost:50051",
   "localhost:40000", // changed bridge to connect to 40000 to get gui working
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
  
//  console.log("Available gRPC methods:", client);     // for testing purposes 
//	console.log("Client methods:", Object.keys(Object.getPrototypeOf(client)));

//	client.MonitorTemperatureStatus( request , (err, response) => {
//		if (err) {
//		console.error("gRPC error:", err);
//		return res.status(500).json({ error: "gRPC request failed" });
  //    //return res.status(500).json({ error: err.message });
//    }

//	const call = client.MonitorTemperatureStatus(request);
// added required metadata
	const metadata = new grpc.Metadata();
	metadata.add("authorization", "Bearer TOKEN_123");
	metadata.add("trace-id", "web-ui-123");
	metadata.add("client-id", "browser");

	const call = client.MonitorTemperatureStatus(request, metadata);

	let results = [];

	call.on("data", (response) => {
		console.log("Temperature update:", response);
		results.push(response);
	});

	call.on("end", () => {
		console.log("Stream ended");
		res.json({ stream: results });
	});

	call.on("error", (err) => {
		console.error("Stream error:", err);   
		res.status(500).json({ error: "gRPC streaming failed" });});
  });

// Start Express
app.listen(3000, () => {
  console.log("Bridge server running on http://localhost:3000");
});
