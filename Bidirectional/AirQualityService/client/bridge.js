//bridge to connect GUI to gRPC

const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(cors());
app.use(express.json());

const path = require("path");
const PROTO_PATH = path.join(
  __dirname,
  "../server/protos/airquality.proto"
);

//console.log("DIR:", __dirname);    //testing
//console.log("PROTO_PATH:", PROTO_PATH);

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const grpcObj = grpc.loadPackageDefinition(packageDef);
//console.log("Loaded gRPC object:", grpcObj);    // for testing purposes 

const client = new grpcObj.airquality.AirQualityService(
//  "localhost:50051",
   "localhost:40000", // changed bridge to connect to 40000 to get gui working
  grpc.credentials.createInsecure()
);

// HTTP endpoint the GUI will call
app.post("/MonitorAirQuality", (req, res) => {
  //const { sensorId, co2Level } = req.body;
  let readings = req.body.readings;

   if (!Array.isArray(readings)) {
    readings = [req.body];
  }

	//if (!sensorId || !co2Level) {
	//	return res.status(400).json({ error: "Sensor ID and co2Level required" });
	//}

    // Validate
  for (const r of readings) {
    if (!r.sensorId || !r.co2Level) {
      return res.status(400).json({ error: "Each reading must include sensorId and co2Level" });
    }
  }

 //const request = {
  //  sensorId: sensorId,
  //  co2Level: Number(co2Level),
   // timestamp: new Date().toISOString()
  //};
  
  //console.log("Available gRPC methods:", client);     // for testing purposes 
	//console.log("Client methods:", Object.keys(Object.getPrototypeOf(client)));


  //	const call = client.MonitorAirQuality(request);
  // added required metadata
	const metadata = new grpc.Metadata();
	metadata.add("authorization", "Bearer TOKEN_123");
	metadata.add("trace-id", "web-ui-123");
	metadata.add("client-id", "browser");
	
	// 1. Start the stream WITH metadata
  const call = client.MonitorAirQuality(metadata);

  let results = [];

  // 2. Send the first message
  //call.write(request);

  // 3. Listen for streaming responses
  call.on("data", (response) => {
    console.log("Air quality update:", response);
    results.push(response);
  });

    call.on("end", () => {
    console.log("Stream ended");
    res.json({ stream: results });
  });

  call.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).json({ error: err.message });
  });

  // Send each reading into the stream
  for (const r of readings) {
    call.write({
      sensorId: r.sensorId,
      co2Level: Number(r.co2Level),
      timestamp: new Date().toISOString()
    });
  }

    // Close the stream after sending all readings
  call.end();

  });

 // client.MonitorAirQuality({sensorId: sensorId, },metadata, (err, response) => {
  //	 if (err) {
 //     return res.status(500).json({ error: err.message });
  //  }
 //   res.json(response);
  ///	});
	//const call = client.MonitorAirQuality(request, metadata);

// Start Express
app.listen(3000, () => {
  console.log("Bridge server running on http://localhost:3000");
});
