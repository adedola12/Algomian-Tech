import asyncH from 'express-async-handler';
import User   from '../models/userModel.js';
import Role   from '../models/roleModel.js';
import generateToken from '../utils/generateToken.js';

/* 15 min window */
const RESET_EXPIRY_MIN = 15;

/* ----------------------------------------------------------
   POST  /api/admin/users/invite
   Body: { email, firstName, lastName?, roles?[] }
----------------------------------------------------------*/
export const inviteUser = asyncH(async (req, res) => {
  const { email, firstName, lastName = '', roles = [] } = req.body;

  /* ── 1. Duplicate check ───────────────────────── */
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  /* ── 2. Create user with TEMP pwd ──────────────── */
  const tempPwd = crypto.randomBytes(8).toString('hex'); // 16-char tmp pwd
  const user    = await User.create({
    firstName,
    lastName,
    email      : email.toLowerCase(),
    password   : tempPwd,          // hash occurs in pre-save hook
    roles
  });

  /* ── 3. Generate “set-password” token ──────────── */
  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken   = crypto
                                .createHash('sha256')
                                .update(rawToken)
                                .digest('hex');
  user.resetPasswordExpires = Date.now() + RESET_EXPIRY_MIN * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  /* ── 4. Compose & send invitation email ───────── */
  const resetURL = `${process.env.FRONTEND_URL}/create-password?token=${rawToken}`;

  const html = `
    <p>Hi ${firstName || 'there'},</p>
    <p>You’ve been invited to join <b>${process.env.STORE_NAME}</b>.</p>
    <p>Click the button below (or copy the link) to create your password.
       This link is valid for ${RESET_EXPIRY_MIN} minutes.</p>
    <p><a href="${resetURL}"
          style="display:inline-block;background:#ff5a00;color:#fff;
                 padding:10px 18px;border-radius:4px;text-decoration:none">
          Set my password
       </a></p>
    <p>${resetURL}</p>
    <hr/>
    <small>If you weren’t expecting this email, you can ignore it.</small>
  `;

  await sendMail({
    to      : user.email,
    subject : 'You’ve been invited – set up your Algomian account',
    html
  });

  /* ── 5. Respond to admin caller ───────────────── */
  res.status(201).json({ _id: user._id, email: user.email });
});

/* GET /api/admin/users */
export const listUsers = asyncH(async (req,res) => {
  const users = await User.find({ roles:{ $in:req.user.roles.map(r=>r._id) } })
                          .select('-password')
                          .populate('roles','name');
  res.json(users);
});

/* PATCH /api/admin/users/:id  { roles:[roleId,…] } */
export const updateUserRoles = asyncH(async (req,res) => {
  const user = await User.findById(req.params.id);
  if(!user){ res.status(404); throw new Error('User not found'); }
  user.roles = req.body.roles;
  await user.save();
  res.json({ message:'Roles updated' });
});
