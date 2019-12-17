import * as fs from 'fs-extra';
import { homedir } from 'os';

export class SessionManager {
  private static sessionIdExpirationInMinutes = 14;

  private readonly username: string;
  private readonly password: string;
  private readonly caller: string;
  private readonly path: string;

  constructor(username: string, password: string) {
    this.caller = 'WEB';
    this.path = `${homedir()}/.homebridge-bee-hive`;

    this.username = username;
    this.password = password;

    fs.ensureDir(this.path, err => {
      if (err) {
        throw new Error(`Unable to create directory for Bee Hive, this is required to persist token: ${err}`);
      }
    });
  }

  public loadSessionIdFromDisk(): string | null {
    const sessionIdFilename = `${this.path}/session`;

    if (!fs.existsSync(sessionIdFilename)) {
      return null;
    }

    const stats = fs.statSync(sessionIdFilename);
    const diff = new Date().getTime() - stats.mtime.getTime();
    const minutes = Math.round(diff / 60000);

    if (minutes >= SessionManager.sessionIdExpirationInMinutes) {
      return null;
    }

    return fs.readFileSync(sessionIdFilename, 'utf8').toString();
  }

  public async persistSessionId(sessionId: string) {
    const error = await fs.outputFile(`${this.path}/session`, sessionId);

    if (error) {
      throw new Error(`Unable to write session file to disk ${error}`);
    }
  }

  public buildAuthenticationBody(): any {
    return {
      sessions: [
        {
          caller: this.caller,
          username: this.username,
          // tslint:disable-next-line:object-literal-sort-keys
          password: this.password,
        },
      ],
    };
  }
}
