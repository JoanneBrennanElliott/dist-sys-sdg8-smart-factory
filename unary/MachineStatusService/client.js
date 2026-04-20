//Client code to be added here JBE
//JBE unary client service CheckMachineStatus


// client.js

var readlineSync = require('readline-sync')
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/proto/unary.proto"

//var movies = grpc.loadPackageDefinition(packageDefinition).movies;
//var machine = grpc.loadPackageDefinition(packageDefinition).unary;
var unary = grpc.loadPackageDefinition(packageDefinition).unary;

//  Implement service methods (unary signature: (call, callback)) 
//function passing in machineID to do // CheckMachineStatus

function main() {
  const address = "127.0.0.1:50051";

 
}

main();
