// Libs
import axios from 'axios';
import { Logger } from 'winston';

import { Worker } from '@types';

// Class
class WorkerModel {
    private logger: Logger;
    private static WORKERAPIURL = process.env.WORKER_API_URL;
    private static CREDENTIAL = process.env.CREDENTIAL;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * A method to find some worker using the card id.
    */
    public async findByCardId(cardId: string): Promise<Worker> {
        // Try to find the card Id.
        const res = await axios.get(
            `${WorkerModel.WORKERAPIURL}/worker/card/${cardId}`,
            {
                headers: {
                    Authorization: `Bearer ${WorkerModel.CREDENTIAL}`,
                }
            });
        if (res.data.status == 'Error') throw `Error. ${res.data.message}`;
        return res.data.data;
    }
}

// Code
export default WorkerModel;