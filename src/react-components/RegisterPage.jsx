import { useContext, useEffect, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { ToastContext } from "../context/ToastContext";

import API_BASE from "../config";

export const RegisterPage = () => {
  const registerFormRef = useRef(null);

  const { showLogin, setShowLogin } = useContext(AppContext);

  const { showToast } = useContext(ToastContext);
  
  const handleRegisterFormSuccess = useCallback((e) => {
    const { result } = e.detail;
    setShowLogin(true);
    console.log(result.message);
    showToast(result.message);
  });
  
  const handleRegisterFormFailure = useCallback((e) => {
    const { result } = e.detail;
    const { message } = result;

    console.log(message);
    showToast(message);
  });

  const handleRegisterFormInvalid = useCallback((e) => {
    const { message } = e.detail;

    console.log(message);
    showToast(message);
  });

  //Bind events.
  useEffect(() => {
    if (registerFormRef.current) {
      registerFormRef.current.addEventListener('x-form:success', handleRegisterFormSuccess);
      registerFormRef.current.addEventListener('x-form:failure', handleRegisterFormFailure);
      registerFormRef.current.addEventListener('x-form:invalid', handleRegisterFormInvalid);
    }
  }, [showLogin]);

  return (
    <div
      className='register-page'
    >
      <x-form
        key='register-form'
        url={`${API_BASE}/register`}
        ref={registerFormRef}
        className='register-form'
      >
        <span
          className='title'
        >
          Register an account
        </span>
        <form-item required type='username'></form-item>
        <form-item required type='password'></form-item>
        <div className="line-with-link">
          <span>Already own an account?</span>
          <a
            key='show-login-link'
            onClick={() => {
              setShowLogin(true);
            }}
            href='#'
          >
            Login
          </a>
        </div>
        <button slot="submit-button">Register</button>
      </x-form>
    </div>
  );
}