import { homedir } from 'os';
import { BeeHive } from './bee-hive';
import { SessionManager } from './session-manager';
import callbackify from './util/callbackify';

let Service: any;
let Characteristic: any;

export default function(homebridge: any) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory('homebridge-bee-hive', 'HomebridgeBeeHive', HomebridgeBeeHive);
}

interface IAccessory {
  accessory: string;
  product: string;
  displayName: string;
  id: string;
  name: string;
  username: string;
  password: string;
}

class HomebridgeBeeHive {
  private beeHive: BeeHive;
  private readonly log: (message: string) => void;
  private accessory: IAccessory;

  // services
  private lightBulbService: any;

  constructor(log: (message: string) => void, accessory: IAccessory) {
    const sessionManager = new SessionManager(accessory.username, accessory.password);
    this.beeHive = new BeeHive(log, sessionManager);

    this.log = log;
    this.accessory = accessory;

    this.log(`🐝🐝🐝 Initialising BeeHive 🐝🐝🐝`);

    switch (accessory.product) {
      case 'light-bulb': {
        this.initialiseLightBulb(accessory);
        return;
      }
      default:
        throw new Error(`Sorry but ${accessory.product} isn't supported by BeeHive`);
    }
  }

  public setLightState = async (on: boolean) => {
    this.log(`Setting state for ${this.accessory.displayName}`);
    await this.beeHive.changeLight(this.accessory.id, on);
  };

  public getLightState = async () => {
    this.log(`Getting state for ${this.accessory.displayName}`);
    return await this.beeHive.isLightEnabled(this.accessory.id);
  };

  public getServices = () => [this.lightBulbService];

  private initialiseLightBulb(config: any) {
    const lightBulbService = new Service.Lightbulb(`${config.displayName} Light`);

    lightBulbService
      .getCharacteristic(Characteristic.On)
      .on('get', callbackify(this.getLightState))
      .on('set', callbackify(this.setLightState));

    this.lightBulbService = lightBulbService;
  }
}
