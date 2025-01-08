import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';
import { 
  Container, Box, TextField, Button, Typography, Paper, Snackbar, Backdrop, Alert, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && /@/.test(username)) {
      setError('Benutzername darf keine E-Mail-Adresse sein.');
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
          errorMessage = 'Keine gültige E-Mail-Adresse.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'E-Mail-Adresse/Passwort ist falsch oder E-Mail-Adresse ist nicht registriert.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Passwort muss mindestens 6 Zeichen lang sein.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Diese E-Mail wird bereits verwendet.';
          break;
        default:
          errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      }
      setError(errorMessage);
      setOpen(true);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      setOpen(true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError(
        'Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet.'
      );
      setOpen(true);
    } catch (error) {
      let errorMessage =
        'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Ungültige E-Mail-Adresse.';
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
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
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
                label="Benutzername"
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
              label="Password"
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
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setIsSignUp(!isSignUp)}
            >
               {isSignUp
                ? 'Bereits registriert? Hier anmelden'
                : 'Noch keinen Account? Hier registrieren'}
            </Button>
            {!isSignUp && (
              <Button
                fullWidth
                variant="text"
                onClick={handlePasswordReset}
                sx={{ mt: 1 }}
              >
                Passwort vergessen?
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
