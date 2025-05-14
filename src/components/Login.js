import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';
import { 
  Container, Box, TextField, Button, Typography, Paper, Snackbar, Backdrop, Alert, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && /@/.test(username)) {
      setError(t('usernameNoEmail'));
      setOpen(true);
      return;
    }

    try {
      if (isSignUp) {
        // Check if username already exists
        const usernameQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        );
        const usernameSnapshot = await getDocs(usernameQuery);

        if (!usernameSnapshot.empty) {
          setError('Dieser Benutzername wird bereits verwendet!');
          setOpen(true);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Benutzername in Firestore speichern
        await setDoc(doc(db, 'users', user.uid), {
          username: username,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      let errorMessage = '';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = t('invalidEmail');
          break;
        case 'auth/invalid-credential':
          errorMessage = t('invalidCredential');
          break;
        case 'auth/weak-password':
          errorMessage = t('weakPassword');
          break;
        case 'auth/email-already-in-use':
          errorMessage = t('emailInUse');
          break;
        default:
          errorMessage = t('genericError');
      }
      setError(errorMessage);
      setOpen(true);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError(t('enterEmail'));
      setOpen(true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError(
        t('resetLinkSent')
      );
      setOpen(true);
    } catch (error) {
      let errorMessage =
        t('genericError');
      if (error.code === 'auth/invalid-email') {
        errorMessage = t('resetInvalidEmail');
      } 
      setError(errorMessage);
      setOpen(true);
    }
  };

  

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 3, width: '100%' }}>
          <Typography component="h1" variant="h5">
            {isSignUp ? t('signUp') : t('signIn')}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('emailAddress')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isSignUp && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="username"
                label={t('username')}
                type="text"
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                slotProps={{ pattern: '^[^@]+$'}}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {isSignUp ? t('signUp') : t('signIn')}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setIsSignUp(!isSignUp)}
            >
               {isSignUp
                ? t('alreadyRegistered')
                : t('noAccount')}
            </Button>
            {!isSignUp && (
              <Button
                fullWidth
                variant="text"
                onClick={handlePasswordReset}
                sx={{ mt: 1 }}
              >
                {t('forgotPassword')}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
      <Backdrop
        open={open}
        sx={{
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
      />
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => {}}
      >
        <Alert
          variant="filled"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity="error"
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
