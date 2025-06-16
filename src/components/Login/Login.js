import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';
import { Container, TextField, Button, Typography } from '@mui/material';
import SnackbarAlert from '../SnackbarAlert/SnackbarAlert';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import useSnackbar from '../../hooks/useSnackbar';
import {
  Wrapper,
  StyledPaper,
  FormBox,
  SubmitButton,
  ForgotPasswordButton,
  LanguageSwitcherContainer
} from './Login.styles';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const { openSnackbar, snackbarMessage, snackbarSeverity, showAlert, closeSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && /@/.test(username)) {
      showAlert(t('usernameNoEmail'), 'warning');
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
          showAlert(t('usernameTaken'), 'error');
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
      showAlert(errorMessage, 'error');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showAlert(t('enterEmail'), 'warning');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showAlert(t('resetLinkSent'), 'info');
    } catch (error) {
      let errorMessage =
        t('genericError');
      if (error.code === 'auth/invalid-email') {
        errorMessage = t('resetInvalidEmail');
      } 
      showAlert(errorMessage, 'error');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Wrapper>
        <LanguageSwitcherContainer>
          <LanguageSwitcher />
        </LanguageSwitcherContainer>
        <StyledPaper elevation={3}>
           <Typography component="h1" variant="h5">
             {isSignUp ? t('signUp') : t('signIn')}
           </Typography>
          <FormBox component="form" onSubmit={handleSubmit}>
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
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
            >
              {isSignUp ? t('signUp') : t('signIn')}
            </SubmitButton>
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
              <ForgotPasswordButton
                fullWidth
                variant="text"
                onClick={handlePasswordReset}
              >
                {t('forgotPassword')}
              </ForgotPasswordButton>
            )}
          </FormBox>
        </StyledPaper>
      </Wrapper>
       <SnackbarAlert
         open={openSnackbar}
         message={snackbarMessage}
         severity={snackbarSeverity}
         onClose={closeSnackbar}
      />
    </Container>
  );
}

export default Login;
