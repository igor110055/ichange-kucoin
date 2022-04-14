const { createServer } = require("http");
const path = require("path");
const cluster = require("cluster");
const os = require("os");
const { Server } = require("socket.io");

const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const redis = require("redis");
const kucoin = require("kucoin-node-api");
// MODELS
const Commision = require("./src/models/commission");
// config
const app = express();
dotenv.config({
  path: path.resolve("./.env"),
});
const config = require("./config/index");

// ERROR HANDLER
const errorHandler = require("./src/http/middlewares/errorHandler");
// ROUTE
const route = require("./src/routes/index");
const autoBind = require("auto-bind");
global.client = redis.createClient();

class application {
  constructor() {
    autoBind(this);
    this.server();
    this.configuration();
    this.route();
  }
  server() {
    if (cluster.isMaster) {
      this.setupWorkerProcess();
    } else {
      const httpServer = createServer(app);
      const io = new Server(httpServer);
      global.IO = io;

      // use the cluster adapter
      io.adapter(createAdapter());

      // setup connection with the primary process
      setupWorker(io);
      io.on("connection", (socket) => {
        socket.emit('connected' , 'شما به سامانه وصل شدید');
        console.log('seocket is connected');
      });
    }
  }
  setupWorkerProcess() {
    const httpServer = createServer();
    // setup sticky sessions
    setupMaster(httpServer, {
      loadBalancingMethod: "least-connection",
    });
    // setup connections between the workers
    setupPrimary();
    cluster.setupPrimary({
      serialization: "advanced",
    });
    const cpuCount = os.cpus().length;
    for (let index = 0; index < cpuCount; index++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died for Exit`);
      cluster.fork();
    });
    cluster.on("error", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died for Error`);
      cluster.fork();
    });

    httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`server run on Port ${process.env.PORT || 8000}`);
    });
  }
  async configuration() {
    // use the public folder
    app.use("/public", express.static("public"));
    // json
    app.use(express.json());
    // cors
    app.use(cors());
    // morgan
    app.use(morgan("dev"));

    // mongoose connection
    mongoose.connect(process.env.MONGODB_URL, (err) => {
      err ? console.log(err) : console.log("Data Base Successfully Connected");
    });
    // redis connection
    client.connect();
    client.on("connect", () => console.log("Redis Client Connected"));

    kucoin.init(config.kucoin);
    global.kucoin = kucoin;
    // find the commission and add the defult commission
    const commision = await Commision.find({});
    if (commision.length == 0) {
      const addCommission = new Commision({
        percent: 1,
      });
      addCommission.save((err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("commission added");
        }
      });
    }
  }
  route() {
    app.use("/api/v1", route);
    // error Handler
    app.use(errorHandler);
  }
}

module.exports = new application();
