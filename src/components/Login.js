import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { 
  Container, Box, TextField, Button, Typography, Paper, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');

    // I need to add those 2 also: Error: Firebase: Error (auth/email-already-in-use).
    // Error: Firebase: Error (auth/invalid-credential).
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
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
      console.error("Error:", error.message);
      let errorMessage = 'An error occurred. Please try again.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
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
      } else if (error.code === 'auth/user-not-found') {
        errorMessage =
          'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
      }
      setError(errorMessage);
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
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
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
