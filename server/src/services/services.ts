
import { Request, Response } from 'express';
import { HollowClientService } from '../client/client';

export async function putKey(req:Request, res: Response) {
    const key  = req.body.key;
    const data = req.body.value;

    try {
        const apiResponse = await HollowClientService.getClient().then(c => c.put(key, data))
        res.send(apiResponse);
    } catch (error: any) {
        console.error('Error accessing hollowdb:', error.response?.data || error.message);
        res.status(error.response?.status || 500).send('Error accessing hollowdb');
    }
};

export async function getKey(req:Request, res: Response) {
    const { key } = req.params;

    try {
        const apiResponse = await HollowClientService.getClient().then(c => c.get(key));
        res.send(apiResponse);
    } catch (error: any) {
        console.error('Error accessing hollowdb:', error.response?.data || error.message);
        res.status(error.response?.status || 500).send('Error accessing hollowdb');
    }
};
