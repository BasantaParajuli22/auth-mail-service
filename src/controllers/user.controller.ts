import { Request, Response } from 'express';
import User from '../models/User';
import * as mailService from '../services/mail.service';

// PUT /api/users/:id/email-preference
export async function updateEmailPreference(req: Request, res: Response) {
  const { userId } = req.params;
  const { wantsEmails } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { wantsEmails },
      { new: true }
    );
    res.json({ success: true, message: 'Preference updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating preference' });
  }
}

//only admin can use this to send email updates to users mail
export async function sendUpdatesMail(req: Request, res: Response): Promise<void> {
  try {
    const {userId}  = req.params;

    const {updateHeader, updateMessage} = req.body;
    if (!updateHeader || !updateMessage ||
       typeof updateHeader !== "string" || 
       typeof updateMessage !== "string" ) {
      res.status(400).json({ success: false, message: "updateMessage or updateHeader is required" });
      return;
    }

    await mailService.sendUpdatesMailToUsers(updateHeader, updateMessage);

    res.status(200).json({
      success: true,
      message: "Updates mail has been sent to users"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

