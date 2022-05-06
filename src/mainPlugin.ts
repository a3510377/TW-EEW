import { RawData, WebSocket } from "ws";
import { EEWService } from ".";

export class mainPlugin {
  public main: EEWService;

  public onOpenEvent?(this: EEWService, service: EEWService): unknown;
  // TODO add earthquake data
  public onEarthquake?(this: EEWService, data: {}): unknown;
  public onMessageEvent?(
    this: EEWService,
    data: RawData,
    isBinary: boolean
  ): unknown;
  public onCloseEvent?(this: EEWService, code: number, reason: Buffer): unknown;

  /**掛載 */
  public mount(data: EEWService) {
    data.plugins.push(this);
    this.main = data;
  }
  public on: WebSocket["on"] = (
    event: Parameters<WebSocket["on"]>[0],
    listener: Parameters<WebSocket["on"]>[1]
  ) => this.main.on(event, listener);
}
