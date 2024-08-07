import express, { Router } from 'express';
import { userService } from '~/service/user-service';

const userController: express.Router = Router();

userController.get('/info', async (req, res) => {
	const deviceId = req.deviceId;
	const { id, ...user } = await userService.getUserByDeviceId(deviceId);

	return res.status(200).json(user);
});

export { userController };
