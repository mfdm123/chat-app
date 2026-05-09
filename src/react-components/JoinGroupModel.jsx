import API_BASE from '../config';

import { forwardRef, useCallback, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { ToastContext } from "../context/ToastContext";

export const JoinGroupModel = forwardRef((_, ref) => {
  const joinGroupFormRef = useRef(null);

  const { showToast } = useContext(ToastContext);

  const { isLoggedIn } = useContext(AppContext);

  const handleJoinGroupFormSuccess = useCallback((e) => {
    //Get data.
    const { result } = e.detail;
    const { group, message } = result;

    //Update groups data.
    setGroupsData(preGroupsData => preGroupsData.concat(group));

    //Close model automatically.
    ref.current.close();
    
    console.log(message);
    showToast(message);
  });

  const handleJoinGroupFormFailure = useCallback((e) => {
    //Get data.
    const { result } = e.detail;
    const { message } = result;

    console.log(message);
    showToast(message);
  });

  const handleJoinGroupFormInvalid = useCallback((e) => {
    const { message } = e.detail;

    console.log(message);
    showToast(message);
  });

  useEffect(() => {
    if (joinGroupFormRef.current) {
      //Config headers.
      joinGroupFormRef.current.requestHeaders = {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      };

      //Bind Events.
      joinGroupFormRef.current.addEventListener('x-form:success', handleJoinGroupFormSuccess);
      joinGroupFormRef.current.addEventListener('x-form:failure', handleJoinGroupFormFailure);
      joinGroupFormRef.current.addEventListener('x-form:invalid', handleJoinGroupFormInvalid);
    }
  }, [isLoggedIn]);

  return (
    <x-model
      className='join-group-model'
      close-on-overlay
      ref={ref}
    >
      <div
        className='join-group-interface'
      >
        <span
          className='title'
        >
          Join a group
        </span>
        <x-form
          key='join-group-form'
          url={`${API_BASE}/join`}
          ref={joinGroupFormRef}
          className='join-group-form'
        >
          <form-item type='text' label='Group code' name='code' required></form-item>
          <button slot="submit-button">Confirm</button>
        </x-form>
      </div>
    </x-model>
  );
});