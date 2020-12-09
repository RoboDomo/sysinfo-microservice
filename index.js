process.title = process.env.TITLE || "sysinfo-microservice";

const debug = require("debug")("sysinfo"),
  os = require("os"),
  nodeDiskInfo = require("node-disk-info"),
  HostBase = require("microservice-core/HostBase");

class SysInfoHost extends HostBase {
  constructor() {
    const mqtt_host = process.env.MQTT_HOST || "mqtt";
    const topic = process.env.MQTT_TOPIC || "sysinfo";

    super(mqtt_host, topic + "/" + os.hostname());
    this.retain = false;
    this.maxLoadAvg = [];
    this.run();
  }

  async run() {
    for (;;) {
      const disks = await nodeDiskInfo.getDiskInfo();
      this.state = { loadavg: os.loadavg() };
      this.state = { interfaces: os.networkInterfaces() };
      this.state = { cpus: os.cpus() };
      this.state = {
        system: {
          hostname: os.hostname(),
          platform: os.platform(),
          release: os.release(),
          version: os.version(),
          arch: os.arch(),
        },
      };
      this.state = { uptime: os.uptime() };
      this.state = { memory: { free: os.freemem(), total: os.totalmem() } };
      this.state = { disks: disks };

      debug("loadavg", os.loadavg());
      debug("interfaces", os.networkInterfaces());
      debug("disks", disks);
      debug("cpus", os.cpus());
      debug(
        "hostname",
        os.hostname(),
        "platform",
        os.platform(),
        "release",
        os.release(),
        "version",
        os.version(),
        "arch",
        os.arch()
      );
      debug("freemem", os.freemem(), "totalmem", os.totalmem());
      debug("uptime", os.uptime());
      await this.wait(1000);
    }
  }
}

async function main() {
    const host = new SysInfoHost();
}

main();
