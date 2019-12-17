import Axios from 'axios';
import { Header } from './header';
import { SessionManager } from './session-manager';

interface INode {
  id: string;
  name: string;
  isEnabled: boolean;
}

export class BeeHive {
  private static makeNode(node: any): INode {
    return {
      id: node.id,
      name: node.name,
      // tslint:disable-next-line:object-literal-sort-keys
      isEnabled: node.attributes.state.reportedValue === 'ON',
    };
  }

  private static makeNodeAttributes(isEnabled: boolean): any {
    return { nodes: [{ attributes: { state: { targetValue: isEnabled ? 'ON' : 'OFF' } } }] };
  }

  private baseUrl: string = 'https://api-prod.bgchprod.info:443/omnia';
  private sessionManager: SessionManager;
  private readonly logger: (message: string) => void;

  constructor(logger: (message: string) => void, sessionManager: SessionManager) {
    this.logger = logger;
    this.sessionManager = sessionManager;
  }

  public makeHeaders(sessionId: string | null = null) {
    const headers: Header[] = [
      new Header('Content-Type', 'application/vnd.alertme.zoo-6.1+json'),
      new Header('Accept', 'application/vnd.alertme.zoo-6.1+json'),
      new Header('X-Omnia-Client', 'Hive Web Dashboard'),
    ];

    if (sessionId) {
      headers.push(new Header('X-Omnia-Access-Token', sessionId));
    }

    const result = headers.map(header => ({ [header.key]: `${header.value}` }));

    return Object.assign({}, ...result);
  }

  public async authenticate(): Promise<string> {
    const sessionId = this.sessionManager.loadSessionIdFromDisk();

    if (sessionId) {
      this.logger('🐝 Loaded session ID from disk.');
      return sessionId;
    }

    const data = this.sessionManager.buildAuthenticationBody();
    const headers = this.makeHeaders();

    const config = { headers };

    const response = await Axios.post(`${this.baseUrl}/auth/sessions`, data, config);

    if (response.status === 200) {
      const newSessionId: string = response.data.sessions[0].sessionId;
      await this.sessionManager.persistSessionId(newSessionId);
      return newSessionId;
    } else if (response.status === 401) {
      throw new Error(`Unable to authorise user, please check your login credentials.`);
    }

    throw new Error(
      `Unexpected response for auth. StatusText=${response.statusText} StatusCode=${response.status} StatusBody=${response.data}`,
    );
  }

  public async isLightEnabled(id: string): Promise<boolean> {
    const sessionId = await this.authenticate();

    const headers = this.makeHeaders(sessionId);
    const config = { headers };

    try {
      const result = await Axios.get(`${this.baseUrl}/nodes/${id}`, config);
      return result.data.nodes.map(BeeHive.makeNode)[0].isEnabled;
    } catch (err) {
      throw new Error(`Unable to fetch list of nodes: ${err} using headers: ${JSON.stringify(headers)}`);
    }
  }

  // public async nodes(): Promise<Node[]> {
  //   return this.authenticate()
  //     .then(sessionId => this.listNodes(sessionId))
  //     .catch(err => {
  //       this.log(`Unable to request nodes. ${err}`);
  //       return [];
  //     });
  // }

  // public async listNodes(sessionId: string): Promise<Node[]> {
  //   const headers = this.getHeaders(sessionId);

  //   const config = {
  //     headers,
  //   };

  //   return Axios.get(`${this.baseUrl}/nodes`, config)
  //     .then(result => result.data.nodes.map(this.makeNode))
  //     .catch(err => {
  //       throw new Error(`Unable to fetch list of nodes: ${err} using headers: ${JSON.stringify(headers)}`);
  //     });
  // }

  public async changeLight(id: string, isEnabled: boolean) {
    const sessionId = await this.authenticate();
    const headers = this.makeHeaders(sessionId);
    const config = { headers };

    try {
      return Axios.put(`${this.baseUrl}/nodes/${id}`, BeeHive.makeNodeAttributes(isEnabled), config);
    } catch (err) {
      throw new Error(`Unable to update ${id} to ${isEnabled ? 'ON' : 'OFF'}. Reason=${err}`);
    }
  }
}
