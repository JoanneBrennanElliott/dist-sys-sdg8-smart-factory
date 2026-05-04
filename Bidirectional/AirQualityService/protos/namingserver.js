const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "/naming.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef);
const naming = grpcObj.naming;

const registry = {}; // in-memory service registry

function Register(call, callback) {
  const { name, address } = call.request;

  registry[name] = address;

  console.log(`Registered service: ${name} at ${address}`);

  callback(null, { message: `Service ${name} registered` });
}

function Discover(call, callback) {
  const { name } = call.request;

  if (!registry[name]) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Service ${name} not found`
    });
  }

  console.log(`Discovery request for: ${name}`);

  callback(null, { name, address: registry[name] });
}

const server = new grpc.Server();
server.addService(naming.NamingService.service, { Register, Discover });

server.bindAsync(
  "0.0.0.0:5000",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Naming Service running on port 5000");
   // server.start();
  }
);
