import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Google } from '@mui/icons-material';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const AuthDialog = ({ open, onClose }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const storeUser = async (user) => {
    if (!user) return;
    const { uid, displayName, email, phoneNumber, photoURL } = user;
    await setDoc(doc(db, 'users', uid), {
      uid,
      name: displayName || '',
      email: email || '',
      phone: phoneNumber || '',
      photoURL: photoURL || '',
      lastLogin: new Date().toISOString(),
    }, { merge: true });
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await storeUser(result.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handlePhoneLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
        }, auth);
      } else {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
        }, auth);
      }
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmation(confirmationResult);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await confirmation.confirm(otp);
      await storeUser(result.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Login / Sign Up</DialogTitle>
      <DialogContent>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Google />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Continue with Google
        </Button>
        <Typography align="center" variant="body2" sx={{ my: 2 }}>
          OR
        </Typography>
        {!confirmation ? (
          <>
            <TextField
              label="Mobile Number"
              placeholder="+1234567890"
              fullWidth
              value={phone}
              onChange={e => setPhone(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <div id="recaptcha-container" />
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handlePhoneLogin}
              disabled={loading || !phone}
            >
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="Enter OTP"
              fullWidth
              value={otp}
              onChange={e => setOtp(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
            >
              Verify OTP
            </Button>
          </>
        )}
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog; 