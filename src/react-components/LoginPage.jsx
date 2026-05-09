import { useContext, useEffect, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { ToastContext } from "../context/ToastContext";
import API_BASE from "../config";

export const LoginPage = () => {
  const loginFormRef = useRef(null);

  const { setIsLoggedIn, showLogin, setShowLogin } = useContext(AppContext);
  const { showToast } = useContext(ToastContext);

  const handleLoginFormSuccess = useCallback((e) => {
    const { result } = e.detail;
    const { token, message, username, userId } = result;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
    setIsLoggedIn(true);
    console.log(message);
    showToast(message);
  });

  const handleLoginFormFailure = useCallback((e) => {
    const { result } = e.detail;
    const { message } = result;

    console.log(message);
    showToast(message);
  });

  const handleLoginFormInvalid = useCallback((e) => {
    const { message } = e.detail;

    console.log(message);
    showToast(message);
  });

  useEffect(() => {
    if (loginFormRef.current) {
      loginFormRef.current.addEventListener('x-form:success', handleLoginFormSuccess);
      loginFormRef.current.addEventListener('x-form:failure', handleLoginFormFailure);
      loginFormRef.current.addEventListener('x-form:invalid', handleLoginFormInvalid);
    }
  }, [showLogin]);

  return (
    <div
      className='login-page'
    >
      <x-form
        key='login-form'
        url={`${API_BASE}/login`}
        ref={loginFormRef}
        className='login-form'
      >
        <span
          className='title'
        >
          Login
        </span>
        <form-item required type='username'></form-item>
        <form-item required type='password'></form-item>
        <div className="line-with-link">
          <span>Not own an account yet?</span>
          <a
            key='show-register-link'
            onClick={() => {
              setShowLogin(false);
            }}
            href='#'
          >
            Register
          </a>
        </div>
        <button slot="submit-button">Login</button>
      </x-form>
    </div>
  );
}