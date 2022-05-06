import { EEWService } from ".";

export class mainPlugin {
  main: EEWService;
  constructor() {}
  /**open event */
  public onOpenEvent() {}
  /**掛載 */
  public mount(data: EEWService) {
    data.plugins.push(this);
    this.main = data;
  }
}
