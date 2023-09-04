import {HollowClient} from "hollowdb-client";


export class HollowClientService {
    static client: HollowClientService;
    hollowClient: HollowClient;




    private constructor() {};

    private async init() {
        this.hollowClient = await HollowClient.new({
            apiKey: "<YOUR_API_KEY>",
            db: "<YOUR_DATABASE_NAME>"
        });
    }

    static async getInstance() {
        if (!HollowClientService.client) {
            HollowClientService.client = new HollowClientService()
            await HollowClientService.client.init();
        }
        return HollowClientService.client
    }

    static async getClient() {
        return await HollowClientService.getInstance().then(c => c.hollowClient);
    }
    async get(key: string) {
        return await this.hollowClient.get(key);
    }

    async put(key: string, value) {
        return await this.hollowClient.put(key, JSON.stringify(value));
    }
}

