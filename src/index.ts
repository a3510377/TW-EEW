import { RawData, WebSocket } from "ws";
import { config } from "dotenv";
import { mainPlugin } from "./mainPlugin";

config();

export class EEWService extends WebSocket {
  protected _loginType: boolean = false;
  public plugins: mainPlugin[] = [];
  constructor() {
    super(process.env.API_WebSocket || "ws://150.117.110.118:910");
  }
  /**初始化 */
  public setup() {
    if (!process.env.API_KEY) throw new Error("No API KEY");

    this.on("open", () => {
      this.plugins.forEach((_) => _.onOpenEvent.bind(this, this)());
      this.onOpenEvent.bind(this);
    })
      .on("message", () => {
        this.plugins.forEach((_) => _.onMessageEvent.bind(this, this)());
        this.onMessageEvent.bind(this);
      })
      .on("close", () => {
        this.plugins.forEach((_) => _.onCloseEvent.bind(this, this)());
        this.onCloseEvent.bind(this);
      });
  }
  /**open event */
  protected onOpenEvent() {
    console.log("已連線");

    this.send(
      JSON.stringify({
        APIkey: process.env.API_KEY,
        Function: "earthquakeService",
        Type: "subscription",
        FormatVersion: 1,
        UUID: 1,
      })
    );
  }
  /**message event */
  protected onMessageEvent(_data: RawData) {
    let data = JSON.parse(_data.toString());

    if (data.Function === "earthquake") {
    } else if (data.state === "Success") {
      this.emit("ready", this);
      this._loginType = true;
    } else if (data.state === "Warn") throw new Error(data.response);
  }
  /**close event */
  protected onCloseEvent() {
    console.log("失去連線...");
    setTimeout(() => {
      if (this.readyState === 3) this.setup();
    });
  }
  /**現在是否連線到正確 */
  get loginType(): boolean {
    return this._loginType;
  }
}
