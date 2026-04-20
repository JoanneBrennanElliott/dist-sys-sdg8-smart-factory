//JBE unary server service CheckMachineStatus

var readlineSync = require('readline-sync')
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/proto/unary.proto"

//var movies = grpc.loadPackageDefinition(packageDefinition).movies;
//var machine = grpc.loadPackageDefinition(packageDefinition).unary;
var unary = grpc.loadPackageDefinition(packageDefinition).unary;

//  Implement service methods (unary signature: (call, callback)) 
//function passing in machineID to do // CheckMachineStatus

// 3) Create server and register service 
function main() { 
  const server = new grpc.Server(); 
 
  //server.addService(calcProto.Calculator.service, { 
 //  Add: add, 
  //  Multiply: multiply, 
  //}); 
 
  const address = "127.0.0.1:50051"; 
 
  // In production you would use TLS credentials. 
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err) => { 
    if (err) { 
      console.error("Server bind error:", err); 
      process.exit(1); 
    } 
    console.log("gRPC server listening on", address); 
    server.start(); 
  }); 
} 
 
main(); 
