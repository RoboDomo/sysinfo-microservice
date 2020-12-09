process.title = process.env.TITLE || "sysinfo-microservice";

const debug = require("debug")("sysinfo"),
  os = require("os"),
  HostBase = require("microservice-core/HostBase");

class SysInfoHost extends HostBase {
  constructor() {
    const mqtt_host = process.env.MQTT_HOST || "mqtt";
    const topic = process.env.MQTT_TOPIC || "sysinfo";

    super(mqtt_host, topic + '/' + os.hostname());
    this.run();
  }

  async run() {
    for (;;) {
      this.state = { loadavg: os.loadavg() };
      this.state = { interfaces: os.networkInterfaces() };
      this.state = { cpus: os.cpus() };
      this.state = { system: {
        hostname: os.hostname(),
        platform: os.platform(),
        release: os.release(),
        version: os.version(),
        arch: os.arch(),
      }};
      this.state = { uptime: os.uptime() };
      this.state = { memory: { free: os.freemem(), total: os.totalmem()}};

      debug("loadavg", os.loadavg());
      debug("interfaces", os.networkInterfaces());
      debug("cpus", os.cpus());
      debug(
        "hostname", os.hostname(), 
        "platform", os.platform(), 
        "release", os.release(),
        "version", os.version(),
        "arch", os.arch(), 
      );
      debug("freemem", os.freemem(), "totalmem", os.totalmem());
      debug("uptime", os.uptime());
      await this.wait(10000);
    }
  }
};

function main() {
  const host = new SysInfoHost();
}

main();

